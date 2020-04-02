import * as SyntaxNodes from "./syntaxNodes";
import CallArgumentsList from "./callArgumentsList";
import CompilerError from "../errors/compilerError";
import FunctionParametersList from "./functionParametersList";
import InvalidTokenError from "../errors/invalidTokenError";
import OperatorOrder from "./operatorOrder";
import SyntaxKind from "./syntaxKind";
import { SyntaxNode } from "./syntaxNodes";
import Token from "../lexer/token";
import TokenKind from "../lexer/tokenKind";
import UnexpectedTokenError from "../errors/unexpectedTokenError";
import UnknownTokenError from "../errors/unknownTokenError";

export default class Parser
{
    private fileName: string;
    private tokens: Token[];
    private position: number;

    constructor ()
    {
        this.fileName = '';
        this.tokens = [];
        this.position = 0;
    }

    private getToken (relativePosition: number, increasePosition: boolean): Token
    {
        const index = this.position + relativePosition;
        let result: Token;

        if (index < this.tokens.length)
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

    private getNextToken (): Token
    {
        return this.getToken(0, true);
    }

    private get currentToken (): Token
    {
        return this.getToken(0, false);
    }

    private get followerToken (): Token
    {
        return this.getToken(1, false);
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
        const functions: SyntaxNodes.FunctionDeclaration[] = [];

        while (this.currentToken.kind != TokenKind.NoToken)
        {
            switch (this.currentToken.kind)
            {
                case TokenKind.FunctionKeyword:
                {
                    const functionDeclaration = this.parseFunctionDeclaration();
                    functions.push(functionDeclaration);
                    break;
                }
                default:
                    throw new InvalidTokenError('Invalid token in file scope', this.fileName, this.currentToken);
            }
        }

        const fileRoot = new SyntaxNodes.File(this.fileName, functions);

        return fileRoot;
    }

    private parseFunctionDeclaration (): SyntaxNodes.FunctionDeclaration
    {
        const keyword = this.getNextToken();
        const identifier = this.getNextToken();
        const opening = this.getNextToken();
        const parameters = this.parseFunctionParameters();
        const closing = this.getNextToken();
        const type = this.parseTypeClause();
        const body = this.parseSection();

        return new SyntaxNodes.FunctionDeclaration(keyword, identifier, opening, parameters, closing, type, body);
    }

    private parseFunctionParameters (): FunctionParametersList
    {
        const parameters: SyntaxNodes.FunctionParameter[] = [];
        const separators: Token[] = [];

        while ((this.currentToken.kind != TokenKind.ClosingParenthesisToken) && (this.currentToken.kind != TokenKind.NoToken))
        {
            const parameter = this.parseFunctionParameter();
            parameters.push(parameter);

            if (this.currentToken.kind == TokenKind.CommaToken)
            {
                separators.push(this.getNextToken());
            }
            else
            {
                break;
            }
        }

        return new FunctionParametersList(parameters, separators);
    }

    private parseFunctionParameter (): SyntaxNodes.FunctionParameter
    {
        const identifier = this.getNextToken();
        const type = this.parseTypeClause();

        if (type === null)
        {
            throw new CompilerError('Missing type clause in parameter definition', this.fileName, identifier);
        }

        return new SyntaxNodes.FunctionParameter(identifier, type);
    }

    private parseTypeClause (): SyntaxNodes.TypeClause|null
    {
        if (this.currentToken.kind != TokenKind.ColonToken)
        {
            return null;
        }
        else
        {
            const colon = this.getNextToken();
            const identifier = this.getNextToken();

            return new SyntaxNodes.TypeClause(colon, identifier);
        }
    }

    private parseSection (): SyntaxNodes.Section
    {
        const opening = this.getNextToken();

        const statements: SyntaxNode[] = [];

        while ((this.currentToken.kind != TokenKind.ClosingBraceToken) && (this.currentToken.kind != TokenKind.NoToken))
        {
            const statement = this.parseStatement();
            statements.push(statement);

            // TODO: Prevent an infinite loop when there is a syntax error.
        }

        const closing = this.getNextToken();

        return new SyntaxNodes.Section(opening, statements, closing);
    }

    private parseStatement (): SyntaxNode
    {
        let result: SyntaxNode;

        switch (this.currentToken.kind)
        {
            case TokenKind.VarKeyword:
                result = this.parseVariableDeclaration();
                break;
            case TokenKind.OpeningBraceToken:
                result = this.parseSection();
                break;
            case TokenKind.ReturnKeyword:
                result = this.parseReturnStatement();
                break;
            default:
            {
                if (this.isAssignment())
                {
                    result = this.parseAssignment();
                }
                else
                {
                    result = this.parseExpression();
                }
            }
        }

        if (this.currentToken.kind == TokenKind.SemicolonToken)
        {
            // Remove the correct token:
            this.getNextToken();
        }
        else if (result.kind != SyntaxKind.Section) // No semicolon needed after a section.
        {
            throw new InvalidTokenError('Missing semicolon after statement', this.fileName, this.currentToken);
        }

        return result;
    }

    private parseReturnStatement (): SyntaxNodes.ReturnStatement
    {
        const keyword = this.getNextToken();

        let expression: SyntaxNodes.Expression|null = null;

        if (this.currentToken.kind != TokenKind.SemicolonToken)
        {
            expression = this.parseExpression();
        }

        return new SyntaxNodes.ReturnStatement(keyword, expression);
    }

    private parseVariableDeclaration (): SyntaxNodes.VariableDeclaration
    {
        const keyword = this.getNextToken();
        const identifier = this.getNextToken();
        let type: SyntaxNodes.TypeClause|null = null;
        let assignment: Token|null = null;
        let initialiser: SyntaxNodes.Expression|null = null;

        switch (this.currentToken.kind)
        {
            case TokenKind.AssignmentOperator:
                assignment = this.getNextToken();
                initialiser = this.parseExpression();
                break;
            case TokenKind.ColonToken:
                type = this.parseTypeClause();
                break;
            default:
                throw new UnexpectedTokenError('variable declaration identifier', this.fileName, this.followerToken);
        }

        return new SyntaxNodes.VariableDeclaration(keyword, identifier, type, assignment, initialiser);
    }

    private isAssignment (): boolean
    {
        const result = (this.currentToken.kind == TokenKind.IdentifierToken) && (this.followerToken.kind == TokenKind.AssignmentOperator);

        return result;
    }

    private parseAssignment (): SyntaxNodes.Assignment
    {
        const identifierToken = this.getNextToken();
        const operatorToken = this.getNextToken();
        const rightSide = this.parseExpression();

        const result = new SyntaxNodes.Assignment(identifierToken, operatorToken, rightSide);

        return result;
    }

    private parseExpression (parentPriority = 0): SyntaxNodes.Expression
    {
        let left;

        if (this.isUnaryExpression(parentPriority))
        {
            left = this.parseUnaryExpression();
        }
        else
        {
            left = this.parsePrimaryExpression();
        }

        while (this.isBinaryExpression(parentPriority))
        {
            left = this.parseBinaryExpression(left);
        }

        return left;
    }

    private isUnaryExpression (parentPriority: number): boolean
    {
        const unaryPriority = OperatorOrder.getUnaryPriority(this.currentToken);

        const result = (unaryPriority !== 0) && (unaryPriority >= parentPriority);

        return result;
    }

    private isBinaryExpression (parentPriority: number): boolean
    {
        const binaryPriority = OperatorOrder.getBinaryPriority(this.currentToken);

        const result = (binaryPriority !== 0) && (binaryPriority > parentPriority);

        return result;
    }

    private parseUnaryExpression (): SyntaxNodes.UnaryExpression
    {
        const operator = this.getNextToken();
        const operatorPriority = OperatorOrder.getUnaryPriority(operator);
        const operand = this.parseExpression(operatorPriority);

        return new SyntaxNodes.UnaryExpression(operator, operand);
    }

    private parseBinaryExpression (left: SyntaxNodes.Expression): SyntaxNodes.BinaryExpression
    {
        const operator = this.getNextToken();
        const operatorPriority = OperatorOrder.getBinaryPriority(operator);
        const right = this.parseExpression(operatorPriority);

        return new SyntaxNodes.BinaryExpression(left, operator, right);
    }

    private parsePrimaryExpression (): SyntaxNodes.Expression
    {
        switch (this.currentToken.kind)
        {
            case TokenKind.OpeningParenthesisToken:
                return this.parseParenthesizedExpression();
            case TokenKind.IntegerToken:
            case TokenKind.StringToken:
                return this.parseLiteralExpression();
            case TokenKind.IdentifierToken:
                return this.parseIdentifierExpression();
            default:
                throw new UnknownTokenError('expression', this.fileName, this.currentToken);
        }
    }

    private parseParenthesizedExpression (): SyntaxNodes.ParenthesizedExpression
    {
        const opening = this.getNextToken();
        const expression = this.parseExpression();
        const closing = this.getNextToken();

        return new SyntaxNodes.ParenthesizedExpression(opening, expression, closing);
    }

    private parseLiteralExpression (): SyntaxNodes.LiteralExpression
    {
        const literal = this.getNextToken();

        return new SyntaxNodes.LiteralExpression(literal);
    }

    private parseIdentifierExpression (): SyntaxNodes.Expression
    {
        if (this.followerToken.kind == TokenKind.OpeningParenthesisToken)
        {
            return this.parseCallExpression();
        }
        else
        {
            return this.parseVariableExpression();
        }
    }

    private parseCallExpression (): SyntaxNodes.CallExpression
    {
        const identifier = this.getNextToken();
        const opening = this.getNextToken();
        const callArguments = this.parseArguments();
        const closing = this.getNextToken();

        return new SyntaxNodes.CallExpression(identifier, opening, callArguments, closing);
    }

    private parseArguments (): CallArgumentsList
    {
        const expressions: SyntaxNodes.Expression[] = [];
        const separators: Token[] = [];

        while ((this.currentToken.kind != TokenKind.ClosingParenthesisToken) && (this.currentToken.kind != TokenKind.NoToken))
        {
            const expression = this.parseExpression();
            expressions.push(expression);

            if (this.currentToken.kind == TokenKind.CommaToken)
            {
                separators.push(this.getNextToken());
            }
            else
            {
                break;
            }
        }

        return new CallArgumentsList(expressions, separators);
    }

    private parseVariableExpression (): SyntaxNodes.VariableExpression
    {
        const identifier = this.getNextToken();

        return new SyntaxNodes.VariableExpression(identifier);
    }
}
