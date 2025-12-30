import * as Diagnostic from '../diagnostic';
import * as SyntaxNodes from './syntaxNodes';
import { ElementsList } from './elementsList';
import { Namespace } from './namespace';
import { OperatorOrder } from './operatorOrder';
import { SyntaxKind } from './syntaxKind';
import { Token } from '../lexer/token';
import { TokenKind } from '../lexer/tokenKind';

export class Parser
{
    private readonly diagnostic: Diagnostic.Diagnostic;

    private fileName: string;
    private tokens: Token[];
    private position: number;

    constructor (diagnostic: Diagnostic.Diagnostic)
    {
        this.diagnostic = diagnostic;

        this.fileName = '';
        this.tokens = [];
        this.position = 0;
    }

    private getToken (relativePosition: number, increasePosition: boolean): Token
    {
        const index = this.position + relativePosition;
        let result: Token;

        if ((index < this.tokens.length) && (index >= 0))
        {
            result = this.tokens[index];
        }
        else
        {
            result = new Token(TokenKind.NoToken, '');
        }

        if (increasePosition)
        {
            this.position++;
        }

        return result;
    }

    private consumeNextToken (): Token
    {
        return this.getToken(0, true);
    }

    private getCurrentToken (): Token
    {
        return this.getToken(0, false);
    }

    private getFollowerToken (): Token
    {
        return this.getToken(1, false);
    }

    private getPreviousToken (): Token
    {
        return this.getToken(-1, false);
    }

    /**
     * Run the parser for a given token list of a file.
     * @param tokens The list of tokens
     * @param fileName The name/path of the file
     * @return The root of the parsed syntax tree.
     */
    public run (tokens: Token[], fileName: string): SyntaxNodes.File
    {
        this.tokens = tokens;
        this.fileName = fileName;
        this.position = 0;

        const root = this.parseFile();

        return root;
    }

    private parseFile (): SyntaxNodes.File
    {
        const imports: SyntaxNodes.Import[] = [];
        let generics: SyntaxNodes.GenericsDeclaration|null = null;
        const variables: SyntaxNodes.GlobalVariableDeclaration[] = [];
        const fields: SyntaxNodes.FieldVariableDeclaration[] = [];
        const functions: SyntaxNodes.FunctionDeclaration[] = [];
        let module: SyntaxNodes.Module|null = null;

        while (this.getCurrentToken().kind != TokenKind.NoToken)
        {
            switch (this.getCurrentToken().kind)
            {
                case TokenKind.ModuleKeyword:
                case TokenKind.ClassKeyword:
                {
                    module = this.parseModule();
                    break;
                }
                case TokenKind.GenericsKeyword:
                {
                    generics = this.parseGenericsDeclaration();
                    break;
                }
                case TokenKind.ImportKeyword:
                {
                    const importDeclaration = this.parseImport();
                    imports.push(importDeclaration);
                    break;
                }
                case TokenKind.VariableKeyword:
                case TokenKind.ConstantKeyword:
                {
                    const variableDeclaration = this.parseGlobalVariableDeclaration();
                    variables.push(variableDeclaration);
                    break;
                }
                case TokenKind.FieldKeyword:
                {
                    const fieldDeclaration = this.parseFieldVariableDeclaration();
                    fields.push(fieldDeclaration);
                    break;
                }
                case TokenKind.FunctionKeyword:
                case TokenKind.MethodKeyword:
                {
                    const functionDeclaration = this.parseFunctionDeclaration(false);
                    functions.push(functionDeclaration);
                    break;
                }
                case TokenKind.HeaderKeyword:
                {
                    const functionDeclaration = this.parseFunctionModifier();
                    functions.push(functionDeclaration);
                    break;
                }
                case TokenKind.LineCommentToken:
                case TokenKind.BlockCommentToken:
                    this.consumeNextToken();
                    // TODO: Instead of ignoring the comment here, the lexer should add it as trivia to real tokens.
                    break;
                default:
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `The token "${this.getCurrentToken().content}" is not allowed in the file scope.`,
                            Diagnostic.Codes.InvalidTokenInFileScopeError,
                            this.getCurrentToken()
                        )
                    );
            }
        }

        if (module == null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Missing module name in file.`,
                    Diagnostic.Codes.MissingModuleNameError,
                    {
                        fileName: this.fileName,
                        lineNumber: 0,
                        columnNumber: 0,
                    }
                )
            );
        }

        const fileRoot = new SyntaxNodes.File(this.fileName, module, generics, imports, variables, fields, functions);

        return fileRoot;
    }

    private parseModule (): SyntaxNodes.Module
    {
        const keyword = this.consumeNextToken();
        const moduleNamespace = this.parseNamespace();

        const isClass = keyword.kind == TokenKind.ClassKeyword;

        return new SyntaxNodes.Module(keyword, moduleNamespace, isClass);
    }

    private parseGenericsDeclaration (): SyntaxNodes.GenericsDeclaration
    {
        const keyword = this.consumeNextToken();
        const parameters = this.parseGenericParameters();

        return new SyntaxNodes.GenericsDeclaration(keyword, parameters);
    }

    private parseGenericParameters (): ElementsList<SyntaxNodes.GenericParameter>
    {
        const parameters: SyntaxNodes.GenericParameter[] = [];
        const separators: Token[] = [];

        while ((this.getCurrentToken().kind != TokenKind.SemicolonToken) && (this.getCurrentToken().kind != TokenKind.NoToken))
        {
            const parameter = this.parseGenericParameter();
            parameters.push(parameter);

            if (this.getCurrentToken().kind == TokenKind.CommaToken)
            {
                separators.push(this.consumeNextToken());
            }
            else
            {
                break;
            }
        }

        // The semicolon:
        this.consumeNextToken();

        return new ElementsList(parameters, separators);
    }

    private parseGenericParameter (): SyntaxNodes.GenericParameter
    {
        const identifier = this.consumeNextToken();

        return new SyntaxNodes.GenericParameter(identifier);
    }

    private parseImport (): SyntaxNodes.Import
    {
        const keyword = this.consumeNextToken();
        const importNamespace = this.parseNamespace();

        return new SyntaxNodes.Import(keyword, importNamespace);
    }

    private parseNamespace (): Namespace
    {
        let prefixComponents: Token[] = [];
        let pathComponents: Token[] = [];

        let nextToken = this.consumeNextToken();
        while (nextToken.kind != TokenKind.SemicolonToken)
        {
            switch (nextToken.kind)
            {
                case TokenKind.IdentifierToken:
                    pathComponents.push(nextToken);
                    break;
                case TokenKind.AccessOperator:
                    break;
                case TokenKind.ColonToken:
                {
                    const temp = prefixComponents;
                    prefixComponents = pathComponents;
                    pathComponents = temp;

                    break;
                }
                default:
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Unexpected token "${nextToken.content}" in namespace.`,
                            Diagnostic.Codes.UnexpectedTokenInNamespace,
                            nextToken
                        )
                    );
            }

            nextToken = this.consumeNextToken();
        }

        const name = pathComponents.pop();

        if (name == undefined)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Empty namespace.`,
                    Diagnostic.Codes.EmptyNamespaceError,
                    nextToken
                )
            );
        }

        const namespace = Namespace.constructFromTokens(prefixComponents, pathComponents, name);

        return namespace;
    }

    private parseGlobalVariableDeclaration (): SyntaxNodes.GlobalVariableDeclaration
    {
        // TODO: This shares a lot of code with parseLocalVariableDeclaration and parseFieldVariableDeclaration. Could they be unified?

        const keyword = this.consumeNextToken();

        let isConstant: boolean;
        switch (keyword.kind)
        {
            case TokenKind.VariableKeyword:
                isConstant = false;
                break;
            case TokenKind.ConstantKeyword:
                isConstant = true;
                break;
            default:
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unexpected token "${keyword.content}" in variable expression.`,
                        Diagnostic.Codes.UnexpectedTokenInVariableExpressionError,
                        keyword
                    )
                );
        }

        const identifier = this.consumeNextToken();

        let type: SyntaxNodes.TypeClause|null = null;
        let assignment: Token|null = null;
        let initialiser: SyntaxNodes.Expression|null = null;

        switch (this.getCurrentToken().kind)
        {
            case TokenKind.AssignmentOperator:
                assignment = this.consumeNextToken();
                initialiser = this.parseExpression();
                break;
            case TokenKind.ColonToken:
                type = this.parseTypeClause();
                if (this.getCurrentToken().kind == TokenKind.AssignmentOperator)
                {
                    assignment = this.consumeNextToken();
                    initialiser = this.parseExpression();
                }
                break;
            default:
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unexpected token "${this.getFollowerToken().content}" after module variable declaration identifier`,
                        Diagnostic.Codes.UnexpectedTokenAfterVariableDeclarationIdentifierError,
                        this.getCurrentToken()
                    )
                );
        }

        // The semicolon:
        this.consumeNextToken();

        return new SyntaxNodes.GlobalVariableDeclaration(keyword, isConstant, identifier, type, assignment, initialiser);
    }

    private parseFieldVariableDeclaration (): SyntaxNodes.FieldVariableDeclaration
    {
        const keyword = this.consumeNextToken();

        let variableModifier: Token|null = null;
        if (this.getCurrentToken().kind == TokenKind.VariableKeyword)
        {
            variableModifier = this.consumeNextToken();
        }

        const identifier = this.consumeNextToken();
        let type: SyntaxNodes.TypeClause|null = null;
        let assignment: Token|null = null;
        let initialiser: SyntaxNodes.Expression|null = null;

        switch (this.getCurrentToken().kind)
        {
            case TokenKind.AssignmentOperator:
                assignment = this.consumeNextToken();
                initialiser = this.parseExpression();
                break;
            case TokenKind.ColonToken:
                type = this.parseTypeClause();

                if (this.getCurrentToken().kind == TokenKind.AssignmentOperator)
                {
                    assignment = this.consumeNextToken();
                    initialiser = this.parseExpression();
                }
                break;
            default:
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unexpected token "${this.getFollowerToken().content}" after field declaration identifier`,
                        Diagnostic.Codes.UnexpectedTokenAfterFieldDeclarationIdentifierError,
                        this.getCurrentToken()
                    )
                );
        }

        // The semicolon:
        this.consumeNextToken();

        return new SyntaxNodes.FieldVariableDeclaration(keyword, variableModifier, identifier, type, assignment, initialiser);
    }

    private parseFunctionModifier (modifiers: Token[] = []): SyntaxNodes.FunctionDeclaration
    {
        let functionDeclaration: SyntaxNodes.FunctionDeclaration;

        switch (this.getCurrentToken().kind)
        {
            case TokenKind.HeaderKeyword:
            {
                const newModifier = this.consumeNextToken();
                modifiers.push(newModifier);

                functionDeclaration = this.parseFunctionModifier(modifiers);

                break;
            }
            case TokenKind.FunctionKeyword:
            {
                let isExternal = false;

                for (const modifier of modifiers)
                {
                    switch (modifier.kind)
                    {
                        case TokenKind.HeaderKeyword:
                            isExternal = true;
                            break;
                        default:
                            break;
                    }
                }

                functionDeclaration = this.parseFunctionDeclaration(isExternal);

                break;
            }
            default:
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unknown function modifier "${this.getCurrentToken().content}"`,
                        Diagnostic.Codes.UnknownFunctionModifierError,
                        this.getCurrentToken()
                    )
                );
        }

        return functionDeclaration;
    }

    private parseFunctionDeclaration (isExternal: boolean): SyntaxNodes.FunctionDeclaration
    {
        const keyword = this.consumeNextToken();
        const identifier = this.consumeNextToken();
        const opening = this.consumeNextToken();
        const parameters = this.parseFunctionParameters();
        const closing = this.consumeNextToken();
        const type = this.parseTypeClause();
        const body = this.parseSection();

        const isMethod = keyword.kind == TokenKind.MethodKeyword;

        if (isExternal)
        {
            // The semicolon:
            this.consumeNextToken();
        }

        return new SyntaxNodes.FunctionDeclaration(keyword, identifier, opening, parameters, closing, type, body, isMethod, isExternal);
    }

    private parseFunctionParameters (): ElementsList<SyntaxNodes.FunctionParameter>
    {
        const parameters: SyntaxNodes.FunctionParameter[] = [];
        const separators: Token[] = [];

        while ((this.getCurrentToken().kind != TokenKind.ClosingRoundBracketToken) && (this.getCurrentToken().kind != TokenKind.NoToken))
        {
            const parameter = this.parseFunctionParameter();
            parameters.push(parameter);

            if (this.getCurrentToken().kind == TokenKind.CommaToken)
            {
                separators.push(this.consumeNextToken());
            }
            else
            {
                break;
            }
        }

        return new ElementsList(parameters, separators);
    }

    private parseFunctionParameter (): SyntaxNodes.FunctionParameter
    {
        const identifier = this.consumeNextToken();
        const type = this.parseTypeClause();

        if (type === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Missing type clause in parameter definition`,
                    Diagnostic.Codes.MissingTypeClauseInParameterDefinitionError,
                    identifier
                )
            );
        }

        return new SyntaxNodes.FunctionParameter(identifier, type);
    }

    private parseTypeClause (): SyntaxNodes.TypeClause|null
    {
        if (this.getCurrentToken().kind != TokenKind.ColonToken)
        {
            return null;
        }
        else
        {
            const colon = this.consumeNextToken();
            const type = this.parseType();

            return new SyntaxNodes.TypeClause(colon, type);
        }
    }

    private parseType (): SyntaxNodes.Type
    {
        const identifier = this.consumeNextToken();

        if (this.getCurrentToken().kind == TokenKind.OpeningSquareBracketToken)
        {
            const opening = this.consumeNextToken();
            const typeArguments = this.parseTypeArguments();
            const closing = this.consumeNextToken();

            return new SyntaxNodes.Type(identifier, opening, typeArguments, closing);
        }
        else
        {
            return new SyntaxNodes.Type(identifier);
        }
    }

    private parseTypeArguments (): ElementsList<SyntaxNodes.TypeArgument>
    {
        const elements: SyntaxNodes.TypeArgument[] = [];
        const separators: Token[] = [];

        while (true)
        {
            const currentToken = this.getCurrentToken();
            let element: SyntaxNodes.TypeArgument|null;

            switch (currentToken.kind)
            {
                case TokenKind.IdentifierToken:
                    element = this.parseType();
                    break;
                case TokenKind.IntegerToken:
                case TokenKind.StringToken:
                case TokenKind.TrueKeyword:
                case TokenKind.FalseKeyword:
                    element = this.parseLiteralExpression();
                    break;
                case TokenKind.ClosingSquareBracketToken:
                case TokenKind.NoToken:
                    element = null;
                    break;
                default:
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Invalid token in type argument "${currentToken.content}"`,
                            Diagnostic.Codes.InvalidTokenInTypeArgumentError,
                            currentToken
                        )
                    );
            }

            if (element === null)
            {
                break;
            }

            elements.push(element);

            if (this.getCurrentToken().kind == TokenKind.CommaToken)
            {
                separators.push(this.consumeNextToken());
            }
        }

        return new ElementsList(elements, separators);
    }

    private parseSection (): SyntaxNodes.Section|null
    {
        if (this.getCurrentToken().kind != TokenKind.OpeningCurlyBracketToken)
        {
            return null;
        }

        const opening = this.consumeNextToken();

        const statements: SyntaxNodes.Statement[] = [];

        while (true)
        {
            let currentToken = this.getCurrentToken();
            while ((currentToken.kind == TokenKind.LineCommentToken) || (currentToken.kind == TokenKind.BlockCommentToken))
            {
                this.consumeNextToken();
                currentToken = this.getCurrentToken();

                // TODO: Instead of ignoring the comment here, the lexer should add it as trivia to real tokens.
            }

            if ((currentToken.kind == TokenKind.ClosingCurlyBracketToken) || (currentToken.kind == TokenKind.NoToken))
            {
                break;
            }

            const statement = this.parseStatement();
            statements.push(statement);

            // TODO: Prevent an infinite loop when there is a syntax error.
        }

        const closing = this.consumeNextToken();

        return new SyntaxNodes.Section(opening, statements, closing);
    }

    private parseStatement (): SyntaxNodes.Statement
    {
        let result: SyntaxNodes.Statement|null;

        switch (this.getCurrentToken().kind)
        {
            case TokenKind.LetKeyword:
                result = this.parseLocalVariableDeclaration();
                break;
            case TokenKind.ReturnKeyword:
                result = this.parseReturnStatement();
                break;
            case TokenKind.IfKeyword:
                result = this.parseIfStatement();
                break;
            case TokenKind.WhileKeyword:
                result = this.parseWhileStatement();
                break;
            case TokenKind.IdentifierToken:
            {
                if (this.getFollowerToken().kind == TokenKind.AssignmentOperator)
                {
                    result = this.parseAssignment();
                    break;
                }
                // Fallthrough otherwise, meaning parse it as an expression.
            }
            default:
            {
                const expression = this.parseExpression();

                switch (expression.kind)
                {
                    case SyntaxKind.AccessExpression:
                    case SyntaxKind.CallExpression:
                        result = expression;
                        break;
                    default:
                        this.diagnostic.throw(
                            new Diagnostic.Error(
                                `Expression "${expression.kind}" is not allowed as a statement.`,
                                Diagnostic.Codes.ExpressionNotAllowedAsStatementError,
                                this.getCurrentToken()
                            )
                        );
                    // TODO: Should this default be replaced with an explicit handling of every TokenKind?
                }

                break;
                // TODO: Should this default be replaced with an explicit handling of every TokenKind?
            }
        }

        if (result == null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unknown statement "${this.getCurrentToken().content}"`,
                    Diagnostic.Codes.UnknownStatementError,
                    this.getCurrentToken()
                )
            );
        }

        if (this.getCurrentToken().kind == TokenKind.SemicolonToken)
        {
            // Remove the correct token:
            this.consumeNextToken();
        }
        // No semicolon needed after a closing curly bracket (often a section):
        else if (this.getPreviousToken().kind != TokenKind.ClosingCurlyBracketToken)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Missing semicolon after statement`,
                    Diagnostic.Codes.MissingSemicolonAfterStatementError,
                    this.getCurrentToken()
                )
            );
        }

        return result;
    }

    private parseReturnStatement (): SyntaxNodes.ReturnStatement
    {
        const keyword = this.consumeNextToken();

        let expression: SyntaxNodes.Expression|null = null;

        if (this.getCurrentToken().kind != TokenKind.SemicolonToken)
        {
            expression = this.parseExpression();
        }

        return new SyntaxNodes.ReturnStatement(keyword, expression);
    }

    private parseLocalVariableDeclaration (): SyntaxNodes.LocalVariableDeclaration
    {
        const keyword = this.consumeNextToken();

        let variableModifier: Token|null = null;
        if (this.getCurrentToken().kind == TokenKind.VariableKeyword)
        {
            variableModifier = this.consumeNextToken();
        }

        const identifier = this.consumeNextToken();
        let type: SyntaxNodes.TypeClause|null = null;
        let assignment: Token|null = null;
        let initialiser: SyntaxNodes.Expression|null = null;

        switch (this.getCurrentToken().kind)
        {
            case TokenKind.AssignmentOperator:
                assignment = this.consumeNextToken();
                initialiser = this.parseExpression();
                break;
            case TokenKind.ColonToken:
                type = this.parseTypeClause();

                if (this.getCurrentToken().kind == TokenKind.AssignmentOperator)
                {
                    assignment = this.consumeNextToken();
                    initialiser = this.parseExpression();
                }
                break;
            default:
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unexpected token "${this.getFollowerToken().content}" after local variable declaration identifier`,
                        Diagnostic.Codes.UnexpectedTokenAfterVariableDeclarationIdentifierError,
                        this.getCurrentToken()
                    )
                );
        }

        return new SyntaxNodes.LocalVariableDeclaration(keyword, variableModifier, identifier, type, assignment, initialiser);
    }

    private parseIfStatement (): SyntaxNodes.IfStatement
    {
        const keyword = this.consumeNextToken();
        const condition = this.parseExpression();
        const section = this.parseSection();

        if (section === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    'Missing section in if statement.',
                    Diagnostic.Codes.MissingSectionInIfStatementError,
                    keyword
                )
            );
        }

        let elseClause: SyntaxNodes.ElseClause|null = null;

        if (this.getCurrentToken().kind == TokenKind.ElseKeyword)
        {
            elseClause = this.parseElseClause();
        }

        return new SyntaxNodes.IfStatement(keyword, condition, section, elseClause);
    }

    private parseElseClause (): SyntaxNodes.ElseClause
    {
        const keyword = this.consumeNextToken();
        let followUp: SyntaxNodes.Section | SyntaxNodes.IfStatement;

        if (this.getCurrentToken().kind == TokenKind.IfKeyword)
        {
            followUp = this.parseIfStatement();
        }
        else
        {
            const section = this.parseSection();

            if (section === null)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        'Missing section in else clause.',
                        Diagnostic.Codes.MissingSectionInElseClauseError,
                        keyword
                    )
                );
            }

            followUp = section;
        }

        return new SyntaxNodes.ElseClause(keyword, followUp);
    }

    private parseWhileStatement (): SyntaxNodes.WhileStatement
    {
        const keyword = this.consumeNextToken();
        const condition = this.parseExpression();
        const section = this.parseSection();

        if (section === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    'Missing section in while statement.',
                    Diagnostic.Codes.MissingSectionInWhileStatementError,
                    keyword
                )
            );
        }

        return new SyntaxNodes.WhileStatement(keyword, condition, section);
    }

    private parseAssignment (): SyntaxNodes.Assignment
    {
        const identifierToken = this.consumeNextToken();
        const operatorToken = this.consumeNextToken();
        const rightSide = this.parseExpression();

        const result = new SyntaxNodes.Assignment(identifierToken, operatorToken, rightSide);

        return result;
    }

    private parseExpression (parentPriority = 0): SyntaxNodes.Expression
    {
        let left: SyntaxNodes.Expression;

        if (this.isUnaryExpression(parentPriority))
        {
            left = this.parseUnaryExpression();
        }
        else
        {
            left = this.parsePrimaryExpression();

            if (this.getCurrentToken().kind == TokenKind.AccessOperator)
            {
                left = this.parseAccessExpression(left);
            }
        }

        while (this.isBinaryExpression(parentPriority))
        {
            left = this.parseBinaryExpression(left);
        }

        return left;
    }

    private isUnaryExpression (parentPriority: number): boolean
    {
        const unaryPriority = OperatorOrder.getUnaryPriority(this.getCurrentToken());

        const result = (unaryPriority !== 0) && (unaryPriority >= parentPriority);

        return result;
    }

    private isBinaryExpression (parentPriority: number): boolean
    {
        const binaryPriority = OperatorOrder.getBinaryPriority(this.getCurrentToken());

        const result = (binaryPriority !== 0) && (binaryPriority > parentPriority);

        return result;
    }

    private parseUnaryExpression (): SyntaxNodes.UnaryExpression
    {
        const operator = this.consumeNextToken();
        const operatorPriority = OperatorOrder.getUnaryPriority(operator);
        const operand = this.parseExpression(operatorPriority);

        return new SyntaxNodes.UnaryExpression(operator, operand);
    }

    private parseBinaryExpression (left: SyntaxNodes.Expression): SyntaxNodes.BinaryExpression
    {
        const operator = this.consumeNextToken();
        const operatorPriority = OperatorOrder.getBinaryPriority(operator);
        const right = this.parseExpression(operatorPriority);

        return new SyntaxNodes.BinaryExpression(left, operator, right);
    }

    private parsePrimaryExpression (): SyntaxNodes.PrimaryExpression
    {
        switch (this.getCurrentToken().kind)
        {
            case TokenKind.OpeningRoundBracketToken:
                return this.parseBracketedExpression();
            case TokenKind.IntegerToken:
            case TokenKind.StringToken:
            case TokenKind.TrueKeyword:
            case TokenKind.FalseKeyword:
                return this.parseLiteralExpression();
            case TokenKind.IdentifierToken:
                if (this.getFollowerToken().kind == TokenKind.OpeningRoundBracketToken)
                {
                    return this.parseCallExpression();
                }
                else
                {
                    return this.parseIdentifierExpression();
                }
            case TokenKind.NewKeyword:
                return this.parseInstantiationExpression();
            default:
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unknown expression "${this.getCurrentToken().content}"`,
                        Diagnostic.Codes.UnknownExpressionError,
                        this.getCurrentToken()
                    )
                );
        }
    }

    private parseBracketedExpression (): SyntaxNodes.BracketedExpression
    {
        const opening = this.consumeNextToken();
        const expression = this.parseExpression();
        const closing = this.consumeNextToken();

        return new SyntaxNodes.BracketedExpression(opening, expression, closing);
    }

    private parseLiteralExpression (): SyntaxNodes.LiteralExpression
    {
        const literal = this.consumeNextToken();

        return new SyntaxNodes.LiteralExpression(literal);
    }

    private parseAccessExpression (primaryExpression: SyntaxNodes.PrimaryExpression): SyntaxNodes.AccessExpression
    {
        const dot = this.consumeNextToken();

        let member: SyntaxNodes.CallExpression|SyntaxNodes.IdentifierExpression;
        if (this.getFollowerToken().kind == TokenKind.OpeningRoundBracketToken)
        {
            member = this.parseCallExpression();
        }
        else
        {
            member = this.parseIdentifierExpression();
        }

        return new SyntaxNodes.AccessExpression(primaryExpression, dot, member);
    }

    private parseCallExpression (): SyntaxNodes.CallExpression
    {
        const identifier = this.consumeNextToken();
        const opening = this.consumeNextToken();
        const callArguments = this.parseCallArguments();
        const closing = this.consumeNextToken();

        return new SyntaxNodes.CallExpression(identifier, opening, callArguments, closing);
    }

    private parseCallArguments (): ElementsList<SyntaxNodes.Expression>
    {
        const expressions: SyntaxNodes.Expression[] = [];
        const separators: Token[] = [];

        while ((this.getCurrentToken().kind != TokenKind.ClosingRoundBracketToken) && (this.getCurrentToken().kind != TokenKind.NoToken))
        {
            const expression = this.parseExpression();
            expressions.push(expression);

            if (this.getCurrentToken().kind == TokenKind.CommaToken)
            {
                separators.push(this.consumeNextToken());
            }
            else
            {
                break;
            }
        }

        return new ElementsList(expressions, separators);
    }

    private parseInstantiationExpression (): SyntaxNodes.InstantiationExpression
    {
        const keyword = this.consumeNextToken();
        const type = this.parseType();
        const opening = this.consumeNextToken();
        const constructorArguments = this.parseCallArguments();
        const closing = this.consumeNextToken();

        return new SyntaxNodes.InstantiationExpression(keyword, type, opening, constructorArguments, closing);
    }

    private parseIdentifierExpression (): SyntaxNodes.IdentifierExpression
    {
        const identifier = this.consumeNextToken();

        return new SyntaxNodes.IdentifierExpression(identifier);
    }
}
