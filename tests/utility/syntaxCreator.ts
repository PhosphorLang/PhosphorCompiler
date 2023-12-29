import * as SyntaxNodes from '../../src/parser/syntaxNodes';
import { Defaults } from './defaults';
import { ElementsList } from '../../src/parser/elementsList';
import { Namespace } from '../../src/parser/namespace';
import { Token } from '../../src/lexer/token';
import { TokenCreator } from './tokenCreator';

export abstract class SyntaxCreator
{
    public static newFile (
        functions: SyntaxNodes.FunctionDeclaration[] = [],
        imports: SyntaxNodes.Import[] = [],
        fileName = Defaults.fileName,
        module = SyntaxCreator.newModule(),
    ): SyntaxNodes.File
    {
        return new SyntaxNodes.File(fileName, module, imports, functions);
    }

    public static newModule (
        namespace = SyntaxCreator.newNamespace(),
        isClass = false
    ): SyntaxNodes.Module
    {
        return new SyntaxNodes.Module(
            TokenCreator.newModuleKeyword(),
            namespace,
            isClass
        );
    }

    public static newNamespace (
        name = TokenCreator.newModuleIdentifier(),
        prefixComponents: Token[] = [],
        pathComponents: Token[] = []
    ): Namespace
    {
        return new Namespace(prefixComponents, pathComponents, name);
    }

    public static newFunctionDeclaration (
        section = SyntaxCreator.newSection(),
        parameters = SyntaxCreator.newFunctionParametersList(),
        type: SyntaxNodes.TypeClause|null = null,
        identifier = TokenCreator.newIdentifier(),
        isExternal = false,
        isMethod = false // TODO: Swap with isExternal.
    ): SyntaxNodes.FunctionDeclaration
    {
        return new SyntaxNodes.FunctionDeclaration(
            TokenCreator.newFunctionKeyword(),
            identifier,
            TokenCreator.newOpeningRoundBrackets(),
            parameters,
            TokenCreator.newClosingRoundBrackets(),
            type,
            section,
            isMethod,
            isExternal
        );
    }

    public static newSection (statements: SyntaxNodes.SyntaxNode[] = []): SyntaxNodes.Section
    {
        return new SyntaxNodes.Section(TokenCreator.newOpeningCurlyBrackets(), statements, TokenCreator.newClosingCurlyBrackets());
    }

    public static newFunctionParametersList (parameters: SyntaxNodes.FunctionParameter[] = []): ElementsList<SyntaxNodes.FunctionParameter>
    {
        const separators: Token[] = [];

        for (let i = 0; i < parameters.length - 1; i++) // - 1 because we need one separator less than expressions.
        {
            separators.push(TokenCreator.newComma());
        }

        return new ElementsList(parameters, separators);
    }

    public static newFunctionParameter (
        identifier = TokenCreator.newVariableIdentifier(),
        typeClause = SyntaxCreator.newTypeClause()
    ): SyntaxNodes.FunctionParameter
    {
        return new SyntaxNodes.FunctionParameter(identifier, typeClause);
    }

    public static newTypeClause (identifier = TokenCreator.newTypeIdentifier()): SyntaxNodes.TypeClause
    {
        return new SyntaxNodes.TypeClause(TokenCreator.newColon(), new SyntaxNodes.Type(identifier));
    }

    public static newFunctionCall (
        callArguments = SyntaxCreator.newCallArgumentsList(),
        identifier = TokenCreator.newIdentifier()
    ): SyntaxNodes.CallExpression
    {
        return new SyntaxNodes.CallExpression(
            identifier,
            TokenCreator.newOpeningRoundBrackets(),
            callArguments,
            TokenCreator.newClosingRoundBrackets()
        );
    }

    public static newCallArgumentsList (expressions: SyntaxNodes.Expression[] = []): ElementsList<SyntaxNodes.Expression>
    {
        const separators: Token[] = [];

        for (let i = 0; i < expressions.length - 1; i++) // - 1 because we need one separator less than expressions.
        {
            separators.push(TokenCreator.newComma());
        }

        return new ElementsList(expressions, separators);
    }

    public static newVariableDeclaration (
        initialiser: SyntaxNodes.Expression|null = null,
        typeClause: SyntaxNodes.TypeClause|null = null,
        identifier = TokenCreator.newVariableIdentifier(),
    ): SyntaxNodes.VariableDeclaration
    {
        const assignment = initialiser === null ? null : TokenCreator.newAssignment();

        return new SyntaxNodes.VariableDeclaration(TokenCreator.newLetKeyword(), identifier, typeClause, assignment, initialiser);
    }

    public static newAssignment (
        expression: SyntaxNodes.Expression,
        identifier = TokenCreator.newVariableIdentifier()
    ): SyntaxNodes.Assignment
    {
        return new SyntaxNodes.Assignment(identifier, TokenCreator.newAssignment(), expression);
    }

    public static newIntegerLiteral (): SyntaxNodes.LiteralExpression
    {
        return new SyntaxNodes.LiteralExpression(TokenCreator.newInteger());
    }

    public static newStringLiteral (): SyntaxNodes.LiteralExpression
    {
        return new SyntaxNodes.LiteralExpression(TokenCreator.newString());
    }

    public static newTrueBooleanLiteral (): SyntaxNodes.LiteralExpression
    {
        return new SyntaxNodes.LiteralExpression(TokenCreator.newTrueKeyword());
    }

    public static newFalseBooleanLiteral (): SyntaxNodes.LiteralExpression
    {
        return new SyntaxNodes.LiteralExpression(TokenCreator.newFalseKeyword());
    }

    public static newElementsList (elements: SyntaxNodes.Expression[] = []): ElementsList<SyntaxNodes.Expression>
    {
        const separators: Token[] = [];

        for (let i = 0; i < elements.length - 1; i++) // - 1 because we need one separator less than elements.
        {
            separators.push(TokenCreator.newComma());
        }

        return new ElementsList(elements, separators);
    }

    public static newBinaryExpression (left: SyntaxNodes.Expression, operator: Token, right: SyntaxNodes.Expression): SyntaxNodes.BinaryExpression
    {
        return new SyntaxNodes.BinaryExpression(
            left,
            operator,
            right
        );
    }

    public static newAddition (left: SyntaxNodes.Expression, right: SyntaxNodes.Expression): SyntaxNodes.BinaryExpression
    {
        return SyntaxCreator.newBinaryExpression(
            left,
            TokenCreator.newPlus(),
            right
        );
    }

    public static newIntegerAddition (): SyntaxNodes.BinaryExpression
    {
        return SyntaxCreator.newAddition(
            SyntaxCreator.newIntegerLiteral(),
            SyntaxCreator.newIntegerLiteral()
        );
    }

    public static newBracketedExpression (expression: SyntaxNodes.Expression): SyntaxNodes.BracketedExpression
    {
        return new SyntaxNodes.BracketedExpression(
            TokenCreator.newOpeningRoundBrackets(),
            expression,
            TokenCreator.newClosingRoundBrackets()
        );
    }

    public static newReturn (expression: SyntaxNodes.Expression|null = null): SyntaxNodes.ReturnStatement
    {
        return new SyntaxNodes.ReturnStatement(TokenCreator.newReturnKeyword(), expression);
    }

    public static newUnaryExpression (operand: SyntaxNodes.Expression, operator: Token): SyntaxNodes.UnaryExpression
    {
        return new SyntaxNodes.UnaryExpression(operator, operand);
    }

    public static newIntegerNegation (): SyntaxNodes.UnaryExpression
    {
        return SyntaxCreator.newUnaryExpression(SyntaxCreator.newIntegerLiteral(), TokenCreator.newMinus());
    }

    public static newVariableExpression (identifier = TokenCreator.newVariableIdentifier()): SyntaxNodes.VariableExpression
    {
        return new SyntaxNodes.VariableExpression(identifier);
    }

    public static newIfStatement (
        condition: SyntaxNodes.Expression = SyntaxCreator.newTrueBooleanLiteral(),
        section = SyntaxCreator.newSection(),
        elseClause: SyntaxNodes.ElseClause|null = null
    ): SyntaxNodes.IfStatement
    {
        return new SyntaxNodes.IfStatement(TokenCreator.newIfKeyword(), condition, section, elseClause);
    }

    public static newElseClause (followUp: SyntaxNodes.Section|SyntaxNodes.IfStatement = SyntaxCreator.newSection()): SyntaxNodes.ElseClause
    {
        return new SyntaxNodes.ElseClause(TokenCreator.newElseKeyword(), followUp);
    }

    public static newWhileStatement (
        condition: SyntaxNodes.Expression = SyntaxCreator.newTrueBooleanLiteral(),
        section = SyntaxCreator.newSection()
    ): SyntaxNodes.WhileStatement
    {
        return new SyntaxNodes.WhileStatement(TokenCreator.newWhileKeyword(), condition, section);
    }

    public static newImport (namespace = SyntaxCreator.newNamespace()): SyntaxNodes.Import
    {
        return new SyntaxNodes.Import(TokenCreator.newImportKeyword(), namespace);
    }
}
