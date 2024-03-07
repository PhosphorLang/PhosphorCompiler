import * as SemanticNodes from '../../src/connector/semanticNodes';
import * as SemanticSymbols from '../../src/connector/semanticSymbols';
import { BinarySemanticOperator } from '../../src/connector/semanticOperators/binarySemanticOperator';
import { BuildInOperators } from '../../src/definitions/buildInOperators';
import { BuildInTypes } from '../../src/definitions/buildInTypes';
import { Defaults } from './defaults';
import { Namespace } from '../../src/parser/namespace';
import { UnarySemanticOperator } from '../../src/connector/semanticOperators/unarySemanticOperator';

export abstract class SemanticCreator
{
    public static newFile (
        functions: SemanticNodes.FunctionDeclaration[] = [],
        variables: SemanticNodes.GlobalVariableDeclaration[] = [],
        fields: SemanticNodes.FieldDeclaration[] = [],
        fileName = Defaults.fileName,
        module = SemanticCreator.newModule(),
        imports: SemanticSymbols.Module[] = []
    ): SemanticNodes.File
    {
        return new SemanticNodes.File(fileName, module, imports, variables, fields, functions);
    }

    public static newModule (
        namespace = SemanticCreator.newNamespace(Defaults.moduleName),
        isEntryPoint = false
    ): SemanticSymbols.Module
    {
        return new SemanticSymbols.Module(namespace, null, new Map(), new Map(), new Map(), isEntryPoint);
    }

    public static newFunctionDeclaration (
        section = SemanticCreator.newSection(),
        symbol = SemanticCreator.newFunctionSymbol()
    ): SemanticNodes.FunctionDeclaration
    {
        return new SemanticNodes.FunctionDeclaration(symbol, section);
    }

    public static newSection (statements: SemanticNodes.Statement[] = []): SemanticNodes.Section
    {
        return new SemanticNodes.Section(statements);
    }

    public static newFunctionSymbol (
        parameters: SemanticSymbols.FunctionParameter[] = [],
        returnType = BuildInTypes.noType,
        namespace = SemanticCreator.newNamespace(Defaults.moduleName, null, Defaults.identifier),
        thisReference = SemanticCreator.newFunctionParameter(),
        isExternal = false,
    ): SemanticSymbols.Function
    {
        return new SemanticSymbols.Function(namespace, returnType, parameters, thisReference, isExternal);
    }

    public static newFunctionParameter (
        type = BuildInTypes.integer,
        namespace = SemanticCreator.newNamespace(Defaults.moduleName, null, Defaults.variableName),
    ): SemanticSymbols.FunctionParameter
    {
        return new SemanticSymbols.FunctionParameter(namespace, type);
    }

    public static newFunctionCall (
        callArguments: SemanticNodes.Expression[] = [],
        symbol = SemanticCreator.newFunctionSymbol()
    ): SemanticNodes.CallExpression
    {
        return new SemanticNodes.CallExpression(symbol, callArguments, null);
    }

    public static newLocalVariableDeclaration (
        initialiser: SemanticNodes.Expression|null = null,
        symbol = SemanticCreator.newVariableSymbol()
    ): SemanticNodes.LocalVariableDeclaration
    {
        return new SemanticNodes.LocalVariableDeclaration(symbol, initialiser);
    }

    public static newVariableSymbol (
        type = BuildInTypes.integer,
        namespace = SemanticCreator.newNamespace(Defaults.moduleName, null, Defaults.variableName),
        isReadonly = true
    ): SemanticSymbols.Variable
    {
        return new SemanticSymbols.Variable(namespace, type, isReadonly);
    }

    public static newAssignment (
        expression: SemanticNodes.Expression,
        variable = SemanticCreator.newVariableExpression()
    ): SemanticNodes.Assignment
    {
        return new SemanticNodes.Assignment(variable, expression);
    }

    public static newIntegerLiteral (value = Defaults.integer): SemanticNodes.LiteralExpression
    {
        return new SemanticNodes.LiteralExpression(value, BuildInTypes.integer);
    }

    public static newStringLiteral (value = Defaults.string): SemanticNodes.LiteralExpression
    {
        return new SemanticNodes.LiteralExpression(value, BuildInTypes.string);
    }

    public static newTrueBooleanLiteral (): SemanticNodes.LiteralExpression
    {
        return new SemanticNodes.LiteralExpression('true', BuildInTypes.boolean);
    }

    public static newFalseBooleanLiteral (): SemanticNodes.LiteralExpression
    {
        return new SemanticNodes.LiteralExpression('false', BuildInTypes.boolean);
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

    public static newLabelSymbol (
        namespace = SemanticCreator.newNamespace(Defaults.moduleName, null, Defaults.labelName),
    ): SemanticSymbols.Label
    {
        return new SemanticSymbols.Label(namespace);
    }

    public static newNamespace (
        moduleName = Defaults.moduleName,
        modulePath: string|null = null,
        memberName: string|null = null,
        memberPath: string|null = null,
    ): Namespace
    {
        if (memberPath === null)
        {
            if (memberName === null)
            {
                return Namespace.constructFromStrings(modulePath, moduleName);
            }
            else
            {
                return Namespace.constructFromStrings(modulePath, moduleName, memberName);
            }
        }
        else if (memberName === null)
        {
            throw new Error('memberPath must be null if memberName is null');
        }
        else
        {
            return Namespace.constructFromStrings(modulePath, moduleName, memberPath, memberName);
        }

    }
}
