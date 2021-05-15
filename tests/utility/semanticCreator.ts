import * as SemanticNodes from "../../src/connector/semanticNodes";
import * as SemanticSymbols from "../../src/connector/semanticSymbols";
import BinarySemanticOperator from "../../src/connector/semanticOperators/binarySemanticOperator";
import BuildInOperators from "../../src/definitions/buildInOperators";
import BuildInTypes from "../../src/definitions/buildInTypes";
import Defaults from "./defaults";
import UnarySemanticOperator from "../../src/connector/semanticOperators/unarySemanticOperator";

export default abstract class SemanticCreator
{
    public static newFile (
        functions: SemanticNodes.FunctionDeclaration[] = [],
        imports: SemanticNodes.Import[] = [],
        fileName = Defaults.fileName
    ): SemanticNodes.File
    {
        return new SemanticNodes.File(fileName, imports, functions);
    }

    public static newFunctionDeclaration (
        section = SemanticCreator.newSection(),
        symbol = SemanticCreator.newFunctionSymbol()
    ): SemanticNodes.FunctionDeclaration
    {
        return new SemanticNodes.FunctionDeclaration(symbol, section);
    }

    public static newSection (statements: SemanticNodes.SemanticNode[] = []): SemanticNodes.Section
    {
        return new SemanticNodes.Section(statements);
    }

    public static newFunctionSymbol (
        parameters: SemanticSymbols.Parameter[] = [],
        returnType = BuildInTypes.noType,
        name = Defaults.identifier,
        isExternal = false,
    ): SemanticSymbols.Function
    {
        return new SemanticSymbols.Function(name, returnType, parameters, isExternal);
    }

    public static newFunctionParameter (type = BuildInTypes.int, name = Defaults.variableName): SemanticSymbols.Parameter
    {
        return new SemanticSymbols.Parameter(name, type);
    }

    public static newFunctionCall (
        callArguments: SemanticNodes.Expression[] = [],
        symbol = SemanticCreator.newFunctionSymbol()
    ): SemanticNodes.CallExpression
    {
        return new SemanticNodes.CallExpression(symbol, callArguments);
    }

    public static newVariableDeclaration (
        initialiser: SemanticNodes.Expression|null = null,
        symbol = SemanticCreator.newVariableSymbol()
    ): SemanticNodes.VariableDeclaration
    {
        return new SemanticNodes.VariableDeclaration(symbol, initialiser);
    }

    public static newVariableSymbol (
        type = BuildInTypes.int,
        name = Defaults.variableName,
        isReadonly = false
    ): SemanticSymbols.Variable
    {
        return new SemanticSymbols.Variable(name, type, isReadonly);
    }

    public static newAssignment (expression: SemanticNodes.Expression, variable = SemanticCreator.newVariableSymbol()): SemanticNodes.Assignment
    {
        return new SemanticNodes.Assignment(variable, expression);
    }

    public static newIntegerLiteral (value = Defaults.integer): SemanticNodes.LiteralExpression
    {
        return new SemanticNodes.LiteralExpression(value, BuildInTypes.int);
    }

    public static newStringLiteral (value = Defaults.string): SemanticNodes.LiteralExpression
    {
        return new SemanticNodes.LiteralExpression(value, BuildInTypes.string);
    }

    public static newTrueBooleanLiteral (): SemanticNodes.LiteralExpression
    {
        return new SemanticNodes.LiteralExpression('true', BuildInTypes.bool);
    }

    public static newFalseBooleanLiteral (): SemanticNodes.LiteralExpression
    {
        return new SemanticNodes.LiteralExpression('false', BuildInTypes.bool);
    }

    public static newUnaryExpression (operand: SemanticNodes.Expression, operator: UnarySemanticOperator): SemanticNodes.UnaryExpression
    {
        return new SemanticNodes.UnaryExpression(operator, operand);
    }

    public static newBinaryExpression (
        left: SemanticNodes.Expression,
        operator: BinarySemanticOperator,
        right: SemanticNodes.Expression): SemanticNodes.BinaryExpression
    {
        return new SemanticNodes.BinaryExpression(operator, left, right);
    }

    public static newIntegerAddition (
        left: SemanticNodes.Expression = SemanticCreator.newIntegerLiteral(),
        right: SemanticNodes.Expression = SemanticCreator.newIntegerLiteral()
    ): SemanticNodes.BinaryExpression
    {
        return SemanticCreator.newBinaryExpression(left, BuildInOperators.binaryIntAddition, right);
    }

    public static newIntegerNegation (): SemanticNodes.UnaryExpression
    {
        return SemanticCreator.newUnaryExpression(SemanticCreator.newIntegerLiteral(), BuildInOperators.unaryIntSubtraction);
    }

    public static newReturn (expression: SemanticNodes.Expression|null = null): SemanticNodes.ReturnStatement
    {
        return new SemanticNodes.ReturnStatement(expression);
    }

    public static newVariableExpression (variable = SemanticCreator.newVariableSymbol()): SemanticNodes.VariableExpression
    {
        return new SemanticNodes.VariableExpression(variable);
    }

    public static newIfStatement (
        condition: SemanticNodes.Expression = SemanticCreator.newTrueBooleanLiteral(),
        section = SemanticCreator.newSection(),
        elseClause: SemanticNodes.ElseClause|null = null
    ): SemanticNodes.IfStatement
    {
        return new SemanticNodes.IfStatement(condition, section, elseClause);
    }

    public static newElseClause (followUp: SemanticNodes.Section|SemanticNodes.IfStatement = SemanticCreator.newSection()): SemanticNodes.ElseClause
    {
        return new SemanticNodes.ElseClause(followUp);
    }

    public static newWhileStatement (
        condition: SemanticNodes.Expression = SemanticCreator.newTrueBooleanLiteral(),
        section = SemanticCreator.newSection()
    ): SemanticNodes.WhileStatement
    {
        return new SemanticNodes.WhileStatement(condition, section);
    }

    public static newLabelSymbol (name = Defaults.labelName): SemanticSymbols.Label
    {
        return new SemanticSymbols.Label(name);
    }

    public static newLabel (labelSymbol = SemanticCreator.newLabelSymbol()): SemanticNodes.Label
    {
        return new SemanticNodes.Label(labelSymbol);
    }

    public static newGotoStatement (labelSymbol = SemanticCreator.newLabelSymbol()): SemanticNodes.GotoStatement
    {
        return new SemanticNodes.GotoStatement(labelSymbol);
    }

    public static newConditionalGotoStatement (
        labelSymbol = SemanticCreator.newLabelSymbol(),
        condition: SemanticNodes.Expression = SemanticCreator.newTrueBooleanLiteral(),
        conditionResult?: boolean
    ): SemanticNodes.ConditionalGotoStatement
    {
        return new SemanticNodes.ConditionalGotoStatement(labelSymbol, condition, conditionResult);
    }
}
