import * as SemanticNodes from "../../src/connector/semanticNodes";
import * as SemanticSymbols from "../../src/connector/semanticSymbols";
import BinarySemanticOperator from "../../src/connector/semanticOperators/binarySemanticOperator";
import BuildInOperators from "../../src/definitions/buildInOperators";
import BuildInTypes from "../../src/definitions/buildInTypes";
import Defaults from "./defaults";

export default abstract class SemanticCreator
{
    public static newFile (functions: SemanticNodes.FunctionDeclaration[] = [], fileName = Defaults.fileName): SemanticNodes.File
    {
        return new SemanticNodes.File(fileName, functions);
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
        name = Defaults.identifier
    ): SemanticSymbols.Function
    {
        return new SemanticSymbols.Function(name, returnType, parameters);
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

    public static newBinaryExpression (
        left: SemanticNodes.Expression,
        operator: BinarySemanticOperator,
        right: SemanticNodes.Expression): SemanticNodes.BinaryExpression
    {
        return new SemanticNodes.BinaryExpression(operator, left, right);
    }

    public static newIntegerAddition (
        left = SemanticCreator.newIntegerLiteral(),
        right = SemanticCreator.newIntegerLiteral()
    ): SemanticNodes.BinaryExpression
    {
        return SemanticCreator.newBinaryExpression(left, BuildInOperators.binaryIntAddition, right);
    }
}
