import * as Instructions from '../common/instructions';
import * as SemanticNodes from '../../connector/semanticNodes';
import * as SemanticSymbols from '../../connector/semanticSymbols';
import BuildInOperators from '../../definitions/buildInOperators';
import BuildInTypes from '../../definitions/buildInTypes';
import LocationedVariableAvr from './locationedVariableAvr';
import LocationManagerAvr from './locationManagerAvr';
import RegisterAvr from './registers/registerAvr';
import RegistersAvr from './registersAvr';
import SemanticKind from '../../connector/semanticKind';
import SemanticTreeTranspiler from '../semanticTreeTranspiler';
import TypesAvr from './typesAvr';

export default class TranspilerAvr implements SemanticTreeTranspiler
{
    private instructions: Instructions.Instruction[];

    private locationManager: LocationManagerAvr;

    private localLabelCounter: number;

    /**
     * Label that leads to the end of the current function before epilogue and return point.
     */
    private returnLabel: string;

    private get nextLocalLabel (): string
    {
        const newLocalLabel = `l_${this.localLabelCounter}`;

        this.localLabelCounter++;

        return newLocalLabel;
    }

    constructor ()
    {
        this.instructions = [];
        this.localLabelCounter = 0;
        this.returnLabel = '';
        this.locationManager = new LocationManagerAvr(this.instructions);
    }

    public run (semanticTree: SemanticNodes.File): string
    {
        this.instructions = [];
        this.localLabelCounter = 0;
        this.returnLabel = '';
        this.locationManager.instructions = this.instructions;

        const fileInstructions: Instructions.Instruction[] = [
            // The start routine calls main and then exits properly:
            new Instructions.SingleOperand('.global', '_start'),
            new Instructions.Label('_start'),
            new Instructions.SingleOperand('rcall', 'main'),
            new Instructions.SingleOperand('rcall', 'exit'),
        ];

        // TODO: What about constants?

        this.transpileFile(semanticTree);

        fileInstructions.push(...this.instructions);

        const fileAssembly = this.convertInstructionsToAssembly(fileInstructions);

        return fileAssembly;
    }

    private convertInstructionsToAssembly (instructions: Instructions.Instruction[]): string
    {
        let assembly = '';

        for (const instruction of instructions)
        {
            assembly += instruction.render() + "\n";
        }

        return assembly;
    }

    /**
     * @returns True if the register arrays are the same, otherwise false.
     */
    private compareTwoRegisterArrays (registersA: RegistersAvr[], registersB: RegistersAvr[]): boolean
    {
        if (registersA.length !== registersB.length)
        {
            return false;
        }

        for (let i = 0; i < registersA.length; i ++)
        {
            if (registersA[i] !== registersB[i])
            {
                return false;
            }
        }

        return true;
    }

    private transpileFile (fileNode: SemanticNodes.File): void
    {
        for (const importNode of fileNode.imports)
        {
            this.transpileFile(importNode.file);
        }

        for (const functionNode of fileNode.functions)
        {
            this.transpileFunction(functionNode);
        }
    }

    private transpileFunction (functionNode: SemanticNodes.FunctionDeclaration): void
    {
        if (functionNode.symbol.isExternal)
        {
            return;
        }

        this.instructions.push(
            // Function name:
            new Instructions.Label(functionNode.symbol.name),
        );

        this.returnLabel = this.nextLocalLabel;

        this.locationManager.enterFunction();

        let parametersSize = 0;
        for (const parameter of functionNode.symbol.parameters)
        {
            const parameterSize = TypesAvr.getTypeSizeInBytes(parameter.type);

            if (parameterSize === null)
            {
                throw new Error(`Transpiler error: The parameter type "${parameter.type.name}" is not supported.`);
            }

            if (parametersSize + parameterSize >= RegistersAvr.argumentValues.length)
            {
                throw new Error('Transpiler error: Too many function arguments (Stack parameters are not supported).');
            }

            const registers: RegisterAvr[] = [];

            for (let i = 0; i < parameterSize; i++)
            {
                registers.push(RegistersAvr.argumentValues[parametersSize]);
                parametersSize++;
            }

            this.locationManager.registerParameter(parameter, registers);
        }

        if (functionNode.section === null)
        {
            throw new Error('Transpiler error: The section of a non-external function is null.');
        }

        this.transpileSection(functionNode.section);

        this.instructions.push(
            // Insert the return label before the function epilogue begins:
            new Instructions.Label(this.returnLabel),
        );

        this.locationManager.leaveFunction();

        this.instructions.push(
            new Instructions.Instruction('ret'),
        );
    }

    private transpileSection (sectionNode: SemanticNodes.Section): void
    {
        this.locationManager.enterSection();

        for (const statement of sectionNode.statements)
        {
            this.transpileStatement(statement);
        }

        this.locationManager.leaveSection();
    }

    private transpileStatement (statementNode: SemanticNodes.SemanticNode): void
    {
        switch (statementNode.kind)
        {
            case SemanticKind.Section:
                this.transpileSection(statementNode as SemanticNodes.Section);
                break;
            case SemanticKind.VariableDeclaration:
                this.transpileVariableDeclaration(statementNode as SemanticNodes.VariableDeclaration);
                break;
            case SemanticKind.ReturnStatement:
                this.transpileReturnStatement(statementNode as SemanticNodes.ReturnStatement);
                break;
            case SemanticKind.Assignment:
                this.transpileAssignment(statementNode as SemanticNodes.Assignment);
                break;
            case SemanticKind.Label:
                this.transpileLabel(statementNode as SemanticNodes.Label);
                break;
            case SemanticKind.GotoStatement:
                this.transpileGotoStatement(statementNode as SemanticNodes.GotoStatement);
                break;
            case SemanticKind.ConditionalGotoStatement:
                this.transpileConditionalGotoStatement(statementNode as SemanticNodes.ConditionalGotoStatement);
                break;
            default:
                switch (statementNode.kind)
                {
                    case SemanticKind.CallExpression:
                        this.transpileCallExpression(statementNode as SemanticNodes.CallExpression);
                        break;
                    default:
                        throw new Error(`Transpile error: The expression of kind "${statementNode.kind}" cannot be used as a statement.`);
                }
        }
    }

    private transpileVariableDeclaration (variableDeclarationNode: SemanticNodes.VariableDeclaration): void
    {
        const variableLocation = this.locationManager.createVariable(variableDeclarationNode.symbol);

        if (variableDeclarationNode.initialiser !== null)
        {
            this.transpileExpression(variableDeclarationNode.initialiser, variableLocation);
        }
    }

    private transpileReturnStatement (returnStatementNode: SemanticNodes.ReturnStatement): void
    {
        if (returnStatementNode.expression !== null)
        {
            const returnSize = TypesAvr.getTypeSizeInBytes(returnStatementNode.expression.type);

            if (returnSize === null)
            {
                throw new Error(`Transpiler error: The return type "${returnStatementNode.expression.type.name}" is not supported.`);
            }

            const returnRegisters = this.locationManager.getFreeReturnRegisters(returnSize);
            const returnVariable = new SemanticSymbols.Variable('return', returnStatementNode.expression.type, false);
            const returnLocation = this.locationManager.registerVariable(returnVariable, returnRegisters);

            this.transpileExpression(returnStatementNode.expression, returnLocation);

            // TODO: Check if the returnLocation is still in the return register!

            this.locationManager.freeVariable(returnLocation);
        }

        this.instructions.push(
            // Return by jumping to the return label at the end of the function after which the epiogue starts:
            new Instructions.SingleOperand('rjmp', this.returnLabel),
        );
    }

    private transpileAssignment (assignmentNode: SemanticNodes.Assignment): void
    {
        const variableLocation = this.locationManager.getVariableLocation(assignmentNode.variable);

        this.transpileExpression(assignmentNode.expression, variableLocation);
    }

    private transpileLabel (labelNode: SemanticNodes.Label): void
    {
        this.instructions.push(
            new Instructions.Label(labelNode.symbol.name),
        );
    }

    private transpileGotoStatement (gotoStatementNode: SemanticNodes.GotoStatement): void
    {
        this.instructions.push(
            new Instructions.SingleOperand('rjmp', gotoStatementNode.labelSymbol.name),
        );
    }

    private transpileConditionalGotoStatement (conditionalGotoStatement: SemanticNodes.ConditionalGotoStatement): void
    {
        const conditionResultTemporaryVariable = new SemanticSymbols.Variable('', conditionalGotoStatement.condition.type, false);

        const conditionResultLocation = this.locationManager.createVariable(conditionResultTemporaryVariable);

        // Transpile the condition with the condition result location as target location:
        this.transpileExpression(conditionalGotoStatement.condition, conditionResultLocation);

        // NOTE: We can only compare to the zero register, thus if the result awaits a true, we must use the not equal branch command:
        const branchCommand = conditionalGotoStatement.conditionResult ? 'brne' : 'breq';

        // NOTE: We know that the conditional expression must be of type bool, thus it is only 8 bit (one register) big.
        this.instructions.push(
            new Instructions.DoubleOperand('cp', conditionResultLocation.location[0].name, RegistersAvr.zero.name),
            new Instructions.SingleOperand(branchCommand, conditionalGotoStatement.labelSymbol.name),
        );

        this.locationManager.freeVariable(conditionResultLocation);
    }

    private transpileExpression (expressionNode: SemanticNodes.Expression, targetLocation: LocationedVariableAvr): void
    {
        switch (expressionNode.kind)
        {
            case SemanticKind.LiteralExpression:
                this.transpileLiteralExpression(expressionNode as SemanticNodes.LiteralExpression, targetLocation);
                break;
            case SemanticKind.VariableExpression:
                this.transpileVariableExpression(expressionNode as SemanticNodes.VariableExpression, targetLocation);
                break;
            case SemanticKind.CallExpression:
                this.transpileCallExpression(expressionNode as SemanticNodes.CallExpression, targetLocation);
                break;
            case SemanticKind.UnaryExpression:
                this.transpileUnaryExpression(expressionNode as SemanticNodes.UnaryExpression, targetLocation);
                break;
            case SemanticKind.BinaryExpression:
                this.transpileBinaryExpression(expressionNode as SemanticNodes.BinaryExpression, targetLocation);
                break;
            default:
                throw new Error(`Transpiler error: No implementation for expression of kind "${expressionNode.kind}"`);
        }
    }

    private transpileLiteralExpression (literalExpression: SemanticNodes.LiteralExpression, targetLocation: LocationedVariableAvr): void
    {
        const literalSize = TypesAvr.getTypeSizeInBytes(literalExpression.type);

        if (literalSize === null)
        {
            throw new Error(`Transpiler error: The literal type "${literalExpression.type.name}" is not supported.`);
        }

        const temporaryRegisters = this.locationManager.getFreeConstantLoadableRegisters(literalSize);
        const temporaryVariable = new SemanticSymbols.Variable('literal', literalExpression.type, false);
        const temporaryLocation = this.locationManager.registerVariable(temporaryVariable, temporaryRegisters);

        switch (literalExpression.type)
        {
            case BuildInTypes.int: // 1 byte long.
                this.instructions.push(
                    new Instructions.DoubleOperand('ldi', temporaryLocation.location[0].name, literalExpression.value),
                );
                break;
            case BuildInTypes.bool: // 1 byte long.
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
                    throw new Error(`Transpiler error: Unknown Bool value of "${literalExpression.value}"`);
                }

                this.instructions.push(
                    new Instructions.DoubleOperand('ldi', temporaryLocation.location[0].name, value),
                );

                break;
            }
            default:
                throw new Error(`Transpiler error: Unsupported literal of type "${literalExpression.type.name}".`);
        }

        for (let i = 0; i < targetLocation.size; i++)
        {
            this.instructions.push(
                new Instructions.DoubleOperand('mov', targetLocation.location[i].name, temporaryLocation.location[i].name),
            );
        }

        this.locationManager.freeVariable(temporaryLocation);
    }

    private transpileVariableExpression (variableExpression: SemanticNodes.VariableExpression, targetLocation: LocationedVariableAvr): void
    {
        const variableLocation = this.locationManager.getVariableLocation(variableExpression.variable);

        if (!this.compareTwoRegisterArrays(targetLocation.location, variableLocation.location))
        {
            for (let i = 0; i < targetLocation.size; i++)
            {
                this.instructions.push(
                    new Instructions.DoubleOperand('mov', targetLocation.location[i].name, variableLocation.location[i].name),
                );
            }
        }
    }

    private transpileCallExpression (callExpression: SemanticNodes.CallExpression, targetLocation?: LocationedVariableAvr): void
    {
        let argumentsSize = 0;
        const argumentVariablesAndSizes: {variable: SemanticSymbols.Variable, size: number}[] = [];

        for (const argument of callExpression.arguments)
        {
            const argumentSize = TypesAvr.getTypeSizeInBytes(argument.type);

            if (argumentSize === null)
            {
                throw new Error(`Transpiler error: Unsupported argument of type "${argument.type.name}".`);
            }

            argumentsSize += argumentSize;

            const argumentVariable = new SemanticSymbols.Variable('argument', argument.type, false);
            argumentVariablesAndSizes.push({variable: argumentVariable, size: argumentSize});
        }

        if (argumentsSize > RegistersAvr.argumentValues.length)
        {
            throw new Error('Transpiler error: Stack arguments are not supported.');
        }

        const argumentRegisters = this.locationManager.getFreeArgumentRegisters(argumentsSize);
        let usedArgumentRegisterCounter = 0;

        const argumentLocations: LocationedVariableAvr[] = [];

        for (const argumentVariableAndSize of argumentVariablesAndSizes)
        {
            const registers: RegisterAvr[] = [];

            for (let i = 0; i < argumentVariableAndSize.size; i++)
            {
                const register = argumentRegisters[usedArgumentRegisterCounter];

                registers.push(register);

                usedArgumentRegisterCounter++;
            }

            const argumentLocation = this.locationManager.registerVariable(argumentVariableAndSize.variable, registers);
            argumentLocations.push(argumentLocation);
        }

        for (let i = 0; i < callExpression.arguments.length; i++)
        {
            const argumentExpression = callExpression.arguments[i];
            const location = argumentLocations[i];

            this.transpileExpression(argumentExpression, location);
        }

        // TODO: Check if any of the locations has changed and restore their position.

        this.instructions.push(
            new Instructions.SingleOperand('rcall', callExpression.functionSymbol.name),
        );

        for (const argumentLocation of argumentLocations)
        {
            this.locationManager.freeVariable(argumentLocation);
        }

        if (targetLocation !== undefined)
        {
            const returnRegisters = RegistersAvr.returnValue.slice(0, targetLocation.size);

            if (!this.compareTwoRegisterArrays(targetLocation.location, returnRegisters))
            {
                for (let i = 0; i < targetLocation.size; i++)
                {
                    this.instructions.push(
                        new Instructions.DoubleOperand('mov', targetLocation.location[i].name, returnRegisters[i].name),
                    );
                }
            }
        }
    }

    private transpileUnaryExpression (unaryExpression: SemanticNodes.UnaryExpression, targetLocation: LocationedVariableAvr): void
    {
        this.transpileExpression(unaryExpression.operand, targetLocation);

        const operator = unaryExpression.operator;

        switch (operator)
        {
            case BuildInOperators.unaryIntAddition:
                // An unary addition has no effect.
                break;
            case BuildInOperators.unaryIntSubtraction:
                switch (targetLocation.size)
                {
                    case 1:
                        this.instructions.push(
                            new Instructions.SingleOperand('neg', targetLocation.location[0].name),
                        );
                        break;
                    default:
                        throw new Error(
                            `Transpiler error: Unary subtraction for operands of size ${targetLocation.size} is not implemented.`);
                }
                break;
            default:
                throw new Error(
                    `Transpiler error: The operator "${operator.kind}" for operand of "${operator.operandType.name}" and ` +
                    `result of "${operator.resultType.name}" is not implemented.`
                );
        }
    }

    private transpileBinaryExpression (binaryExpression: SemanticNodes.BinaryExpression, targetLocation: LocationedVariableAvr): void
    {
        const operator = binaryExpression.operator;

        // Temporary variable for the right operand:
        const temporaryVariable = new SemanticSymbols.Variable('rightOperand', binaryExpression.rightOperand.type, false);
        const temporaryVariableLocation = this.locationManager.createVariable(temporaryVariable);

        this.transpileExpression(binaryExpression.leftOperand, targetLocation);
        this.transpileExpression(binaryExpression.rightOperand, temporaryVariableLocation);

        switch (operator)
        {
            case BuildInOperators.binaryIntAddition:
                this.instructions.push(
                    new Instructions.DoubleOperand('add', targetLocation.location[0].name, temporaryVariableLocation.location[0].name),
                );

                for (let i = 1; i < targetLocation.size; i++)
                {
                    this.instructions.push(
                        new Instructions.DoubleOperand('adc', targetLocation.location[i].name, temporaryVariableLocation.location[i].name),
                    );
                }

                break;
            case BuildInOperators.binaryIntSubtraction:
                this.instructions.push(
                    new Instructions.DoubleOperand('sub', targetLocation.location[0].name, temporaryVariableLocation.location[0].name),
                );

                for (let i = 1; i < targetLocation.size; i++)
                {
                    this.instructions.push(
                        new Instructions.DoubleOperand('sbc', targetLocation.location[i].name, temporaryVariableLocation.location[i].name),
                    );
                }

                break;
            case BuildInOperators.binaryIntEqual:
            case BuildInOperators.binaryIntLess:
            case BuildInOperators.binaryIntGreater:
            {
                let operatorInstruction = 'breq'; // BuildInOperators.binaryIntEqual

                let locationA = targetLocation;
                let locationB = temporaryVariableLocation;

                if (operator != BuildInOperators.binaryIntEqual)
                {
                    operatorInstruction = 'brlt';

                    if (operator == BuildInOperators.binaryIntGreater)
                    {
                        // Reverse the locations because there is no "branch if greater than" operator:
                        locationA = temporaryVariableLocation;
                        locationB = targetLocation;
                    }
                }

                const trueLabel = this.nextLocalLabel;
                const endLabel = this.nextLocalLabel;

                this.instructions.push(
                    new Instructions.DoubleOperand('cp', locationA.location[0].name, locationB.location[0].name),
                    new Instructions.SingleOperand(operatorInstruction, trueLabel),
                    new Instructions.DoubleOperand('mov', targetLocation.location[0].name, RegistersAvr.zero.name),
                    new Instructions.SingleOperand('rjmp', endLabel),
                    new Instructions.Label(trueLabel),
                    // FIXME: We need to go sure that targetLocation is a constant loadable register!
                    new Instructions.DoubleOperand('ldi', targetLocation.location[0].name, '1'),
                    new Instructions.Label(endLabel),
                );

                break;
            }
            default:
                throw new Error(
                    `Transpiler error: The operator "${operator.kind}" for the operands of "${operator.leftType.name}" and ` +
                    `"${operator.rightType.name}" with the result type of "${operator.resultType.name}" is not implemented.`
                );
        }

        this.locationManager.freeVariable(temporaryVariableLocation);
    }
}
