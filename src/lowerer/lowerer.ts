import * as Intermediates from './intermediates';
import * as IntermediateSymbols from './intermediateSymbols';
import * as SemanticNodes from '../connector/semanticNodes';
import * as SemanticSymbols from '../connector/semanticSymbols';
import BuildInFunctions from '../definitions/buildInFunctions';
import BuildInOperators from '../definitions/buildInOperators';
import BuildInTypes from '../definitions/buildInTypes';
import { Intermediate } from './intermediates';
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
    /**
     * Maps an intermediate variable to the index of its last use. \
     * The index is only valid inside a function and applies to the intermediates of the function. \
     * TODO: It is a bit ugly to have this here (globally). Is there a better way without sacrificing convenience?
     */
    private variableLastUseMap: Map<IntermediateSymbols.Variable, number>;

    private variableIntroducedSet: Set<IntermediateSymbols.Variable>;

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
        this.variableLastUseMap = new Map();

        this.variableIntroducedSet = new Set();
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
        this.variableLastUseMap.clear();

        this.variableIntroducedSet.clear();

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

    private generateVariable (size: IntermediateSize, symbol?: SemanticSymbols.Variable): IntermediateSymbols.Variable
    {
        const newVariable = new IntermediateSymbols.Variable(`v#${this.variableCounter}`, size);

        this.variableCounter += 1;

        if (symbol !== undefined)
        {
            if (this.variableSymbolMap.has(symbol))
            {
                throw new Error(`Lowerer error: Variable for symbol "${symbol.name}" already exists.`);
            }

            this.variableSymbolMap.set(symbol, newVariable);
        }

        return newVariable;
    }

    private getVariableFromSymbol (symbol: SemanticSymbols.Variable): IntermediateSymbols.Variable
    {
        const existingVariable = this.variableSymbolMap.get(symbol);

        if (existingVariable === undefined)
        {
            throw new Error(`Lowerer error: Variable for symbol "${symbol.name}" does not exist.`);
        }

        return existingVariable;
    }

    protected markUseTimeIfVariable (readableValue: IntermediateSymbols.ReadableValue, intermediates: Intermediate[]): void
    {
        if (readableValue.kind != IntermediateSymbolKind.Variable)
        {
            return;
        }

        const index = intermediates.length - 1;

        this.variableLastUseMap.set(readableValue, index);
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

                const parameterVariable = this.generateVariable(parameterSymbol.size, parameter);

                functionBody.push(
                    new Intermediates.Introduce(parameterVariable),
                    new Intermediates.Take(parameterVariable, parameterSymbol)
                );
            }

            this.lowerSection(functionDeclaration.section, functionBody);

            // The last instruction of a function must always be a return:
            if ((functionBody.at(-1)?.kind !== IntermediateKind.Return))
            {
                functionBody.push(
                    new Intermediates.Return()
                );
            }

            const functionIntermediate = new Intermediates.Function(functionSymbol, functionBody);

            this.functions.push(functionIntermediate);
        }
    }

    private lowerSection (section: SemanticNodes.Section, intermediates: Intermediate[]): void
    {
        for (const statement of section.statements)
        {
            this.lowerStatement(statement, intermediates);
        }
    }

    private lowerStatement (statement: SemanticNodes.SemanticNode, intermediates: Intermediate[]): void
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

    private lowerVariableDeclaration (variableDeclaration: SemanticNodes.VariableDeclaration, intermediates: Intermediate[]): void
    {
        const variable = this.generateVariable(this.typeToSize(variableDeclaration.symbol.type), variableDeclaration.symbol);

        if (variableDeclaration.initialiser !== null)
        {
            this.lowerExpression(variableDeclaration.initialiser, intermediates, variable);
        }
    }

    private lowerReturnStatement (returnStatement: SemanticNodes.ReturnStatement, intermediates: Intermediate[]): void
    {
        if (returnStatement.expression !== null)
        {
            const returnSymbol = new IntermediateSymbols.ReturnValue(this.typeToSize(returnStatement.expression.type));
            const temporaryVariable = this.generateVariable(returnSymbol.size);

            this.lowerExpression(returnStatement.expression, intermediates, temporaryVariable);

            intermediates.push(
                new Intermediates.Give(returnSymbol, temporaryVariable),
            );
        }

        intermediates.push(
            new Intermediates.Return(),
        );
    }

    private lowerIfStatement (ifStatement: SemanticNodes.IfStatement, intermediates: Intermediate[]): void
    {
        const condition = this.generateVariable(this.typeToSize(ifStatement.condition.type));

        this.lowerExpression(ifStatement.condition, intermediates, condition);

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

    private lowerWhileStatement (whileStatement: SemanticNodes.WhileStatement, intermediates: Intermediate[]): void
    {
        const condition = this.generateVariable(this.typeToSize(whileStatement.condition.type));

        this.lowerExpression(whileStatement.condition, intermediates, condition);

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

    private lowerAssignment (assignment: SemanticNodes.Assignment, intermediates: Intermediate[]): void
    {
        const variable = this.getVariableFromSymbol(assignment.variable);

        if (assignment.expression !== null)
        {
            this.lowerExpression(assignment.expression, intermediates, variable);
        }
    }

    private lowerExpression (
        expression: SemanticNodes.Expression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        switch (expression.kind)
        {
            case SemanticKind.LiteralExpression:
                this.lowerLiteralExpression(expression as SemanticNodes.LiteralExpression, intermediates, targetLocation);
                break;
            case SemanticKind.VariableExpression:
                this.lowerVariableExpression(expression as SemanticNodes.VariableExpression, intermediates, targetLocation);
                break;
            case SemanticKind.CallExpression:
                this.lowerCallExpression(expression as SemanticNodes.CallExpression, intermediates, targetLocation);
                break;
            case SemanticKind.UnaryExpression:
                this.lowerUnaryExpression(expression as SemanticNodes.UnaryExpression, intermediates, targetLocation);
                break;
            case SemanticKind.BinaryExpression:
                this.lowerBinaryExpression(expression as SemanticNodes.BinaryExpression, intermediates, targetLocation);
                break;
            default:
                throw new Error(`Lowerer error: No implementation for expression of kind "${expression.kind}"`);
        }
    }

    private lowerLiteralExpression (
        literalExpression: SemanticNodes.LiteralExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        let literalOrConstant: IntermediateSymbols.Literal | IntermediateSymbols.Constant;

        switch (literalExpression.type)
        {
            case BuildInTypes.int:
                {
                    literalOrConstant = new IntermediateSymbols.Literal(literalExpression.value, this.typeToSize(literalExpression.type));

                    break;
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

                    literalOrConstant = new IntermediateSymbols.Literal(value, this.typeToSize(literalExpression.type));

                    break;
                }
            case BuildInTypes.string:
                {
                    literalOrConstant = this.getOrGenerateConstant(literalExpression.value);

                    break;
                }
            default:
                throw new Error(`Lowerer error: Unknown literal of type "${literalExpression.type.name}"`);
        }

        if (!this.variableIntroducedSet.has(targetLocation))
        {
            intermediates.push(
                new Intermediates.Introduce(targetLocation),
            );

            this.variableIntroducedSet.add(targetLocation);
        }

        intermediates.push(
            new Intermediates.Move(targetLocation, literalOrConstant),
        );
    }

    private lowerVariableExpression (
        variableExpression: SemanticNodes.VariableExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        const variable = this.variableSymbolMap.get(variableExpression.variable);

        if (variable === undefined)
        {
            throw new Error(`Lowerer error: Variable "${variableExpression.variable.name}" used before declaration.`);
        }

        if (variable !== targetLocation)
        {
            if (!this.variableIntroducedSet.has(targetLocation))
            {
                intermediates.push(
                    new Intermediates.Introduce(targetLocation),
                );

                this.variableIntroducedSet.add(targetLocation);
            }

            intermediates.push(
                new Intermediates.Move(targetLocation, variable),
            );
        }
    }

    private lowerCallExpression (
        callExpression: SemanticNodes.CallExpression,
        intermediates: Intermediate[],
        targetLocation?: IntermediateSymbols.Variable
    ): void
    {
        let parameterCounter = 0;

        for (const argumentExpression of callExpression.arguments)
        {
            const temporaryVariable = this.generateVariable(this.typeToSize(argumentExpression.type));

            this.lowerExpression(argumentExpression, intermediates, temporaryVariable);

            const parameter = this.generateParameter(temporaryVariable.size, parameterCounter);
            parameterCounter += 1;

            intermediates.push(
                new Intermediates.Give(parameter, temporaryVariable),
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

        if (targetLocation !== undefined)
        {
            if (functionSymbol.returnSize == IntermediateSize.Void)
            {
                throw new Error(
                    `Lowerer error: Function "${callExpression.functionSymbol.name}" has no return value but is used as an expression.`
                );
            }

            if (!this.variableIntroducedSet.has(targetLocation))
            {
                intermediates.push(
                    new Intermediates.Introduce(targetLocation),
                );

                this.variableIntroducedSet.add(targetLocation);
            }

            const returnValue = new IntermediateSymbols.ReturnValue(functionSymbol.returnSize);

            intermediates.push(
                new Intermediates.Take(targetLocation, returnValue),
            );
        }
    }

    private lowerUnaryExpression (
        unaryExpression: SemanticNodes.UnaryExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        this.lowerExpression(unaryExpression.operand, intermediates, targetLocation);

        const operator = unaryExpression.operator;

        switch (operator)
        {
            case BuildInOperators.unaryIntAddition:
                // An unary addition has no effect.
                break;
            case BuildInOperators.unaryIntSubtraction:
                {
                    if (!this.variableIntroducedSet.has(targetLocation))
                    {
                        intermediates.push(
                            new Intermediates.Introduce(targetLocation),
                        );

                        this.variableIntroducedSet.add(targetLocation);
                    }

                    intermediates.push(
                        new Intermediates.Negate(targetLocation),
                    );

                    break;
                }
            default:
                throw new Error(
                    `Lowerer error: The operator "${operator.kind}" for operand of "${operator.operandType.name}" and ` +
                    `result of "${operator.resultType.name}" is not implemented.`
                );
        }
    }

    private lowerBinaryExpression (
        binaryExpression: SemanticNodes.BinaryExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
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

            this.lowerCallExpression(callExpression, intermediates, targetLocation);
        }
        else
        {
            this.lowerExpression(binaryExpression.leftOperand, intermediates, targetLocation);

            const temporaryVariable = this.generateVariable(this.typeToSize(binaryExpression.rightOperand.type));

            this.lowerExpression(binaryExpression.rightOperand, intermediates, temporaryVariable);

            if (!this.variableIntroducedSet.has(targetLocation))
            {
                intermediates.push(
                    new Intermediates.Introduce(targetLocation),
                );

                this.variableIntroducedSet.add(targetLocation);
            }

            const operator = binaryExpression.operator;

            switch (operator)
            {
                case BuildInOperators.binaryIntAddition:
                    intermediates.push(
                        new Intermediates.Add(targetLocation, temporaryVariable),
                    );
                    break;
                case BuildInOperators.binaryIntSubtraction:
                    intermediates.push(
                        new Intermediates.Subtract(targetLocation, temporaryVariable),
                    );
                    break;
                case BuildInOperators.binaryIntEqual:
                case BuildInOperators.binaryIntLess:
                case BuildInOperators.binaryIntGreater:
                {
                    intermediates.push(
                        new Intermediates.Compare(targetLocation, temporaryVariable),
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
                        new Intermediates.Move(targetLocation, falseLiteral),
                        new Intermediates.Goto(endLabel),
                        new Intermediates.Label(trueLabel),
                        new Intermediates.Move(targetLocation, trueLiteral),
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
        }
    }
}
