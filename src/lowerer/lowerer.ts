import * as Intermediates from './intermediates';
import * as IntermediateSymbols from './intermediateSymbols';
import * as SemanticNodes from '../connector/semanticNodes';
import * as SemanticSymbols from '../connector/semanticSymbols';
import BuildInFunctions from '../definitions/buildInFunctions';
import BuildInOperators from '../definitions/buildInOperators';
import BuildInTypes from '../definitions/buildInTypes';
import { IntermediateKind } from './intermediateKind';
import { IntermediateSize } from './intermediateSize';
import { IntermediateSymbolKind } from './intermediateSymbolKind';
import SemanticKind from '../connector/semanticKind';

/**
 * The lowerer "lowers" semantic by breaking up abstracted structures (like an if statement) into simpler components (e.g. multiple goto
 * statements). This makes implementing a backend much easier because the resulting intermediate code is much simpler and closer to
 * real machine code.
 */
export default class Lowerer
{
    private constantCounter: number;
    private labelCounter: number;
    private variableCounter: number;

    private functions: Intermediates.Function[];
    private externals: Intermediates.External[];
    private constants: Intermediates.Constant[];

    private functionSymbolMap: Map<SemanticSymbols.Function, IntermediateSymbols.Function>;
    private variableSymbolMap: Map<SemanticSymbols.Variable, IntermediateSymbols.Variable>;
    private valueToConstantMap: Map<string, IntermediateSymbols.Constant>;

    constructor ()
    {
        this.constantCounter = 0;
        this.labelCounter = 0;
        this.variableCounter = 0;

        this.functions = [];
        this.externals = [];
        this.constants = [];

        this.functionSymbolMap = new Map();
        this.variableSymbolMap = new Map();
        this.valueToConstantMap = new Map();
    }

    public run (fileSemanticNode: SemanticNodes.File): Intermediates.File
    {
        this.constantCounter = 0;
        this.labelCounter = 0;
        this.variableCounter = 0;

        this.functions = [];
        this.externals = [];
        this.constants = [];

        this.functionSymbolMap.clear();
        this.variableSymbolMap.clear();
        this.valueToConstantMap.clear();

        this.lowerFile(fileSemanticNode);

        return new Intermediates.File(this.functions, this.externals, this.constants);
    }

    private getOrGenerateConstant (value: string): IntermediateSymbols.Constant
    {
        const existingConstant = this.valueToConstantMap.get(value);

        if (existingConstant !== undefined)
        {
            return existingConstant;
        }

        const newConstant = new IntermediateSymbols.Constant(`c#${this.constantCounter}`, value);

        this.constantCounter += 1;

        this.valueToConstantMap.set(value, newConstant);

        const newConstantIntermediate = new Intermediates.Constant(newConstant);
        this.constants.push(newConstantIntermediate);

        return newConstant;
    }

    private generateLabel (): IntermediateSymbols.Label
    {
        const newLabel = new IntermediateSymbols.Label(`l#${this.labelCounter}`);

        this.labelCounter += 1;

        return newLabel;
    }

    private generateParameter (size: IntermediateSize, index: number): IntermediateSymbols.Parameter
    {
        const newParameter = new IntermediateSymbols.Parameter(`p#${index}`, size);

        return newParameter;
    }

    private generateVariable (size: IntermediateSize): IntermediateSymbols.Variable
    {
        const newVariable = new IntermediateSymbols.Variable(`v#${this.variableCounter}`, size);

        this.variableCounter += 1;

        return newVariable;
    }

    private getOrGenerateVariableFromSymbol (symbol: SemanticSymbols.Variable): IntermediateSymbols.Variable
    {
        const existingVariable = this.variableSymbolMap.get(symbol);

        if (existingVariable !== undefined)
        {
            return existingVariable;
        }

        const newVariable = this.generateVariable(this.typeToSize(symbol.type));

        this.variableSymbolMap.set(symbol, newVariable);

        return newVariable;
    }

    private typeToSize (type: SemanticSymbols.Type): IntermediateSize
    {
        switch (type)
        {
            case BuildInTypes.int:
                return IntermediateSize.Native;
            case BuildInTypes.bool:
                return IntermediateSize.Int8;
            case BuildInTypes.string:
                return IntermediateSize.Pointer;
            case BuildInTypes.noType:
                return IntermediateSize.Void;
            default:
                throw new Error(`Lowerer error: No known size for type "${type.name}"`);
        }
    }

    private lowerFile (file: SemanticNodes.File): void
    {
        for (const importNode of file.imports)
        {
            this.lowerImport(importNode);
        }

        for (const functionNode of file.functions)
        {
            this.lowerFunction(functionNode);
        }
    }

    private lowerImport (importNode: SemanticNodes.Import): void
    {
        this.lowerFile(importNode.file);
    }

    private lowerFunction (functionDeclaration: SemanticNodes.FunctionDeclaration): void
    {
        const parameterSizes: IntermediateSize[] = [];
        for (const parameter of functionDeclaration.symbol.parameters)
        {
            const parameterSize = this.typeToSize(parameter.type);
            parameterSizes.push(parameterSize);
        }

        const functionSymbol = new IntermediateSymbols.Function(
            functionDeclaration.symbol.name,
            this.typeToSize(functionDeclaration.symbol.returnType),
            parameterSizes
        );

        this.functionSymbolMap.set(functionDeclaration.symbol, functionSymbol);

        if (functionDeclaration.symbol.isExternal)
        {
            const externalFunction = new Intermediates.External(functionSymbol);
            this.externals.push(externalFunction);
        }
        else
        {
            if (functionDeclaration.section === null)
            {
                throw new Error(`Lowerer error: The section of a non-external function is null."`);
            }

            const functionBody: Intermediates.Statement[] = [];
            let parameterCounter = 0;

            // Receive all parameters for them to be available as variables:
            for (const parameter of functionDeclaration.symbol.parameters)
            {
                const parameterSymbol = this.generateParameter(this.typeToSize(parameter.type), parameterCounter);
                parameterCounter += 1;

                const parameterVariable = this.getOrGenerateVariableFromSymbol(parameter);

                functionBody.push(
                    new Intermediates.Receive(parameterVariable, parameterSymbol)
                );
            }

            this.lowerSection(functionDeclaration.section, functionBody);

            // The last instruction of a function must always be a return:
            if ((functionBody.at(-1)?.kind !== IntermediateKind.Return))
            {
                functionBody.push(
                    new Intermediates.Return(null)
                );
            }

            const functionIntermediate = new Intermediates.Function(functionSymbol, functionBody);

            this.functions.push(functionIntermediate);
        }
    }

    private lowerSection (section: SemanticNodes.Section, intermediates: Intermediates.Intermediate[]): void
    {
        for (const statement of section.statements)
        {
            this.lowerStatement(statement, intermediates);
        }
    }

    private lowerStatement (statement: SemanticNodes.SemanticNode, intermediates: Intermediates.Intermediate[]): void
    {
        switch (statement.kind)
        {
            case SemanticKind.Section:
                this.lowerSection(statement as SemanticNodes.Section, intermediates);
                break;
            case SemanticKind.VariableDeclaration:
                this.lowerVariableDeclaration(statement as SemanticNodes.VariableDeclaration, intermediates);
                break;
            case SemanticKind.ReturnStatement:
                this.lowerReturnStatement(statement as SemanticNodes.ReturnStatement, intermediates);
                break;
            case SemanticKind.IfStatement:
                this.lowerIfStatement(statement as SemanticNodes.IfStatement, intermediates);
                break;
            case SemanticKind.WhileStatement:
                this.lowerWhileStatement(statement as SemanticNodes.WhileStatement, intermediates);
                break;
            case SemanticKind.Assignment:
                this.lowerAssignment(statement as SemanticNodes.Assignment, intermediates);
                break;
            case SemanticKind.CallExpression:
                this.lowerCallExpression(statement as SemanticNodes.CallExpression, intermediates);
                break;
            default:
                throw new Error(`Lowerer error: The expression of kind "${statement.kind}" cannot be used as a statement.`);
        }
    }

    private lowerVariableDeclaration (
        variableDeclaration: SemanticNodes.VariableDeclaration,
        intermediates: Intermediates.Intermediate[]
    ): void
    {
        const variable = this.getOrGenerateVariableFromSymbol(variableDeclaration.symbol);

        intermediates.push(
            new Intermediates.Introduce(variable),
        );

        if (variableDeclaration.initialiser !== null)
        {
            const loweredExpressionResult = this.lowerExpression(variableDeclaration.initialiser, intermediates);

            intermediates.push(
                new Intermediates.Move(variable, loweredExpressionResult),
            );
        }
    }

    private lowerReturnStatement (returnStatement: SemanticNodes.ReturnStatement, intermediates: Intermediates.Intermediate[]): void
    {
        let returnValue: IntermediateSymbols.ReadableValue | null = null;

        if (returnStatement.expression !== null)
        {
            returnValue = this.lowerExpression(returnStatement.expression, intermediates);
        }

        intermediates.push(
            new Intermediates.Return(returnValue),
        );
    }

    private lowerIfStatement (ifStatement: SemanticNodes.IfStatement, intermediates: Intermediates.Intermediate[]): void
    {
        const condition = this.lowerExpression(ifStatement.condition, intermediates);

        const endLabelSymbol = this.generateLabel();
        const falseLiteral = new IntermediateSymbols.Literal('0', IntermediateSize.Int8);

        if (ifStatement.elseClause === null)
        {
            intermediates.push(
                new Intermediates.Compare(condition, falseLiteral),
                new Intermediates.JumpIfEqual(endLabelSymbol),
            );

            this.lowerSection(ifStatement.section, intermediates);

            intermediates.push(
                new Intermediates.Label(endLabelSymbol),
            );
        }
        else
        {
            const elseLabelSymbol = this.generateLabel();

            intermediates.push(
                new Intermediates.Compare(condition, falseLiteral),
                new Intermediates.JumpIfEqual(elseLabelSymbol),
            );

            this.lowerSection(ifStatement.section, intermediates);

            intermediates.push(
                new Intermediates.Goto(endLabelSymbol),
                new Intermediates.Label(elseLabelSymbol),
            );

            this.lowerStatement(ifStatement.elseClause.followUp, intermediates);

            intermediates.push(
                new Intermediates.Label(endLabelSymbol),
            );
        }
    }

    private lowerWhileStatement (whileStatement: SemanticNodes.WhileStatement, intermediates: Intermediates.Intermediate[]): void
    {
        const condition = this.lowerExpression(whileStatement.condition, intermediates);

        const startLabelSymbol = this.generateLabel();
        const endLabelSymbol = this.generateLabel();

        const falseLiteral = new IntermediateSymbols.Literal('0', IntermediateSize.Int8);

        intermediates.push(
            new Intermediates.Label(startLabelSymbol),
            new Intermediates.Compare(condition, falseLiteral),
            new Intermediates.Goto(endLabelSymbol),
        );

        this.lowerSection(whileStatement.section, intermediates);

        intermediates.push(
            new Intermediates.Goto(startLabelSymbol),
            new Intermediates.Label(endLabelSymbol),
        );
    }

    private lowerAssignment (assignment: SemanticNodes.Assignment, intermediates: Intermediates.Intermediate[]): void
    {
        const variable = this.getOrGenerateVariableFromSymbol(assignment.variable);

        intermediates.push(
            new Intermediates.Introduce(variable),
        );

        if (assignment.expression !== null)
        {
            const loweredExpressionValue = this.lowerExpression(assignment.expression, intermediates);

            intermediates.push(
                new Intermediates.Move(variable, loweredExpressionValue),
            );
        }
    }

    private lowerExpression (
        expression: SemanticNodes.Expression,
        intermediates: Intermediates.Intermediate[]
    ): IntermediateSymbols.ReadableValue
    {
        switch (expression.kind)
        {
            case SemanticKind.LiteralExpression:
                return this.lowerLiteralExpression(expression as SemanticNodes.LiteralExpression);
            case SemanticKind.VariableExpression:
                return this.lowerVariableExpression(expression as SemanticNodes.VariableExpression);
            case SemanticKind.CallExpression:
                {
                    const callExpression = expression as SemanticNodes.CallExpression;

                    const callResult = this.lowerCallExpression(callExpression, intermediates);

                    if (callResult === null)
                    {
                        throw new Error(
                            `Lowerer error: The function "${callExpression.functionSymbol.name}" has no return value `
                            + `but is used as an expression.`
                        );
                    }

                    return callResult;
                }
            case SemanticKind.UnaryExpression:
                return this.lowerUnaryExpression(expression as SemanticNodes.UnaryExpression, intermediates);
            case SemanticKind.BinaryExpression:
                return this.lowerBinaryExpression(expression as SemanticNodes.BinaryExpression, intermediates);
            default:
                throw new Error(`Lowerer error: No implementation for expression of kind "${expression.kind}"`);
        }
    }

    private lowerLiteralExpression (
        literalExpression: SemanticNodes.LiteralExpression
    ): IntermediateSymbols.Literal | IntermediateSymbols.Constant
    {
        switch (literalExpression.type)
        {
            case BuildInTypes.int:
                {
                    const literal = new IntermediateSymbols.Literal(literalExpression.value, this.typeToSize(literalExpression.type));
                    return literal;
                }
            case BuildInTypes.bool:
                {
                    let value: string;

                    if (literalExpression.value === 'true')
                    {
                        value = '1';
                    }
                    else if (literalExpression.value === 'false')
                    {
                        value = '0';
                    }
                    else
                    {
                        throw new Error(`Lowerer error: Unknown Bool value of "${literalExpression.value}"`);
                    }

                    const literal = new IntermediateSymbols.Literal(value, this.typeToSize(literalExpression.type));
                    return literal;
                }
            case BuildInTypes.string:
                {
                    const constant = this.getOrGenerateConstant(literalExpression.value);
                    return constant;
                }
            default:
                throw new Error(`Lowerer error: Unknown literal of type "${literalExpression.type.name}"`);
        }
    }

    private lowerVariableExpression (variableExpression: SemanticNodes.VariableExpression): IntermediateSymbols.Variable
    {
        const variable = this.variableSymbolMap.get(variableExpression.variable);

        if (variable === undefined)
        {
            throw new Error(`Lowerer error: Variable "${variableExpression.variable.name}" used before declaration.`);
        }

        return variable;
    }

    private lowerCallExpression (
        callExpression: SemanticNodes.CallExpression,
        intermediates: Intermediates.Intermediate[]
    ): IntermediateSymbols.Variable|null
    {
        let parameterCounter = 0;

        for (const argumentExpression of callExpression.arguments)
        {
            const loweredArgument = this.lowerExpression(argumentExpression, intermediates);

            const parameter = this.generateParameter(this.typeToSize(argumentExpression.type), parameterCounter);
            parameterCounter += 1;

            intermediates.push(
                new Intermediates.Parameterise(parameter, loweredArgument),
            );
        }

        const functionSymbol = this.functionSymbolMap.get(callExpression.functionSymbol);

        if (functionSymbol === undefined)
        {
            throw new Error(`Lowerer error: Function "${callExpression.functionSymbol.name}" used before declaration.`);
        }

        intermediates.push(
            new Intermediates.Call(functionSymbol),
        );

        if (functionSymbol.returnSize != IntermediateSize.Void)
        {
            const returnValue = new IntermediateSymbols.ReturnValue(functionSymbol.returnSize);
            const temporaryVariable = this.generateVariable(functionSymbol.returnSize);

            intermediates.push(
                new Intermediates.Receive(temporaryVariable, returnValue),
            );

            return temporaryVariable;
        }

        return null;
    }

    private lowerUnaryExpression (
        unaryExpression: SemanticNodes.UnaryExpression,
        intermediates: Intermediates.Intermediate[]
    ): IntermediateSymbols.ReadableValue
    {
        const loweredOperandValue = this.lowerExpression(unaryExpression.operand, intermediates);

        const operator = unaryExpression.operator;

        switch (operator)
        {
            case BuildInOperators.unaryIntAddition:
                // An unary addition has no effect.
                break;
            case BuildInOperators.unaryIntSubtraction:
                {
                    if (loweredOperandValue.kind === IntermediateSymbolKind.Variable)
                    {
                        intermediates.push(
                            new Intermediates.Negate(loweredOperandValue),
                        );
                    }
                    else
                    {
                        const temporaryVariable = this.generateVariable(loweredOperandValue.size);

                        intermediates.push(
                            new Intermediates.Introduce(temporaryVariable),
                            new Intermediates.Move(temporaryVariable, loweredOperandValue),
                            new Intermediates.Negate(temporaryVariable),
                        );
                    }

                    break;
                }
            default:
                throw new Error(
                    `Lowerer error: The operator "${operator.kind}" for operand of "${operator.operandType.name}" and ` +
                    `result of "${operator.resultType.name}" is not implemented.`
                );
        }

        return loweredOperandValue;
    }

    private lowerBinaryExpression (
        binaryExpression: SemanticNodes.BinaryExpression,
        intermediates: Intermediates.Intermediate[]
    ): IntermediateSymbols.ReadableValue
    {
        if (binaryExpression.operator == BuildInOperators.binaryStringEqual)
        {
            // NOTE: Compiler magic: The comparison of a string is call to the build in function "stringsAreEqual".

            const callExpression = new SemanticNodes.CallExpression(
                BuildInFunctions.stringsAreEqual,
                [
                    binaryExpression.leftOperand,
                    binaryExpression.rightOperand,
                ]
            );

            const loweredCallExpression = this.lowerCallExpression(callExpression, intermediates);

            if (loweredCallExpression === null)
            {
                throw new Error(`Lowerer error: The buildin function "${BuildInFunctions.stringsAreEqual.name}" has no return value.`);
            }

            return loweredCallExpression;
        }
        else
        {
            let loweredLeftOperand = this.lowerExpression(binaryExpression.leftOperand, intermediates);
            const loweredRightOperand = this.lowerExpression(binaryExpression.rightOperand, intermediates);

            // Make sure the left operand is a variable:
            if (loweredLeftOperand.kind !== IntermediateSymbolKind.Variable)
            {
                const temporaryVariable = this.generateVariable(loweredLeftOperand.size);

                intermediates.push(
                    new Intermediates.Introduce(temporaryVariable),
                    new Intermediates.Move(temporaryVariable, loweredLeftOperand),
                );

                loweredLeftOperand = temporaryVariable;
            }

            const operator = binaryExpression.operator;

            switch (operator)
            {
                case BuildInOperators.binaryIntAddition:
                    intermediates.push(
                        new Intermediates.Add(loweredLeftOperand, loweredRightOperand),
                    );
                    break;
                case BuildInOperators.binaryIntSubtraction:
                    intermediates.push(
                        new Intermediates.Subtract(loweredLeftOperand, loweredRightOperand),
                    );
                    break;
                case BuildInOperators.binaryIntEqual:
                case BuildInOperators.binaryIntLess:
                case BuildInOperators.binaryIntGreater:
                {
                    intermediates.push(
                        new Intermediates.Compare(loweredLeftOperand, loweredRightOperand),
                    );

                    const trueLabel = this.generateLabel();
                    const endLabel = this.generateLabel();

                    switch (operator)
                    {
                        case BuildInOperators.binaryIntEqual:
                            intermediates.push(
                                new Intermediates.JumpIfEqual(trueLabel)
                            );
                            break;
                        case BuildInOperators.binaryIntLess:
                            intermediates.push(
                                new Intermediates.JumpIfLess(trueLabel)
                            );
                            break;
                        case BuildInOperators.binaryIntGreater:
                            intermediates.push(
                                new Intermediates.JumpIfGreater(trueLabel)
                            );
                            break;
                    }

                    const trueLiteral = new IntermediateSymbols.Literal('1', IntermediateSize.Int8);
                    const falseLiteral = new IntermediateSymbols.Literal('0', IntermediateSize.Int8);

                    intermediates.push(
                        new Intermediates.Move(loweredLeftOperand, falseLiteral),
                        new Intermediates.Goto(endLabel),
                        new Intermediates.Label(trueLabel),
                        new Intermediates.Move(loweredLeftOperand, trueLiteral),
                        new Intermediates.Label(endLabel),
                    );

                    break;
                }
                default:
                    throw new Error(
                        `Lowerer error: The operator "${operator.kind}" for the operands of "${operator.leftType.name}" and ` +
                        `"${operator.rightType.name}" with the result type of "${operator.resultType.name}" is not implemented.`
                    );
            }

            return loweredLeftOperand;
        }
    }
}
