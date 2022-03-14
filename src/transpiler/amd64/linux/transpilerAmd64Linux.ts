import * as SemanticNodes from '../../../connector/semanticNodes';
import * as SemanticSymbols from '../../../connector/semanticSymbols';
import { BuildInOperators } from '../../../definitions/buildInOperators';
import { BuildInTypes } from '../../../definitions/buildInTypes';
import { LocationedVariableAmd64 } from '../locationedVariableAmd64';
import { LocationManagerAmd64Linux } from './locationManagerAmd64Linux';
import { RegistersAmd64Linux } from './registersAmd64Linux';
import { SemanticKind } from '../../../connector/semanticKind';
import { SemanticTreeTranspiler } from '../../semanticTreeTranspiler';
import { TextEncoder } from 'node:util';

export class TranspilerAmd64Linux extends LocationManagerAmd64Linux implements SemanticTreeTranspiler
{
    protected code: string[];
    private constantCode: string[];

    private localLabelCounter: number;

    private get nextLocalLabel (): string
    {
        const newLocalLabel = `.l#${this.localLabelCounter}`;

        this.localLabelCounter++;

        return newLocalLabel;
    }

    /**
     * A counter for generating unqiue constant IDs.
     */
    private constantCounter: number;

    private importedFunctions: Set<SemanticSymbols.Function>;

    constructor ()
    {
        super();

        this.code = [];
        this.constantCode = [];
        this.constantCounter = 0;
        this.localLabelCounter = 0;
        this.importedFunctions = new Set<SemanticSymbols.Function>();
    }

    public run (semanticTree: SemanticNodes.File): string
    {
        this.code = [];
        this.constantCode = [];
        this.constantCounter = 0;
        this.localLabelCounter = 0;
        this.importedFunctions.clear();

        const assembly: string[] = [];

        this.transpileFile(semanticTree);

        assembly.push('[section .rodata]');

        assembly.push(...this.constantCode);

        assembly.push('[section .text]');

        // All imported functions must be marked as extern to be found by the Assembler:
        for (const importedFunction of this.importedFunctions)
        {
            assembly.push(`[extern ${importedFunction.name}]`);
        }

        assembly.push(
            '[extern exit]',
            // The start routine calls main and then exits properly:
            '[global _start]',
            '_start:',
            'call main',
            'call exit',
        );

        assembly.push(...this.code);

        const result = assembly.join("\n") + "\n";

        return result;
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

        this.code.push(functionNode.symbol.name + ':'); // Function name

        // Save base pointer:
        this.code.push(`push ${RegistersAmd64Linux.stackBasePointer.bit64}`);
        // Set base pointer to current stack pointer:
        this.code.push(`mov ${RegistersAmd64Linux.stackBasePointer.bit64}, ${RegistersAmd64Linux.stackPointer.bit64}`);

        this.addNewVariableStack(true);

        let parameterCounter = 0;
        for (const parameter of functionNode.symbol.parameters)
        {
            if (parameterCounter >= RegistersAmd64Linux.integerArguments.length)
            {
                throw new Error('Transpiler error: Stack parameters are not supported.');
            }

            const register = RegistersAmd64Linux.integerArguments[parameterCounter];
            parameterCounter++;

            this.pushVariable(parameter, register);
        }

        if (functionNode.section === null)
        {
            throw new Error('Transpiler error: The section of a non-external function is null.');
        }

        this.transpileSection(functionNode.section);

        this.removeLastVariableStack(true);
    }

    private transpileSection (sectionNode: SemanticNodes.Section): void
    {
        this.addNewVariableStack();

        for (const statement of sectionNode.statements)
        {
            this.transpileStatement(statement);
        }

        this.removeLastVariableStack();
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
                this.transpileExpression(statementNode as SemanticNodes.Expression);
        }
    }

    private transpileVariableDeclaration (variableDeclarationNode: SemanticNodes.VariableDeclaration): void
    {
        const variableLocation = this.pushVariable(variableDeclarationNode.symbol);

        if (variableDeclarationNode.initialiser !== null)
        {
            this.transpileExpression(variableDeclarationNode.initialiser, variableLocation);
        }
    }

    private transpileReturnStatement (returnStatementNode: SemanticNodes.ReturnStatement): void
    {
        if (returnStatementNode.expression !== null)
        {
            const temporaryVariable = new SemanticSymbols.Variable('return', returnStatementNode.expression.type, false);
            const temporaryLocationedVariable = new LocationedVariableAmd64(temporaryVariable, RegistersAmd64Linux.integerReturn);

            // TODO: Replace hard coded return register with actual type and size:
            this.transpileExpression(returnStatementNode.expression, temporaryLocationedVariable);
        }

        this.code.push(
            'leave',
            'ret',
        );
    }

    private transpileAssignment (assignmentNode: SemanticNodes.Assignment): void
    {
        const variableLocation = this.getVariableLocation(assignmentNode.variable);

        this.transpileExpression(assignmentNode.expression, variableLocation);
    }

    private transpileLabel (labelNode: SemanticNodes.Label): void
    {
        // TODO: Should we make the labels "local labels" starting with a point?
        this.code.push(`${labelNode.symbol.name}:`);
    }

    private transpileGotoStatement (gotoStatementNode: SemanticNodes.GotoStatement): void
    {
        this.code.push(`jmp ${gotoStatementNode.labelSymbol.name}`);
    }

    private transpileConditionalGotoStatement (conditionalGotoStatement: SemanticNodes.ConditionalGotoStatement): void
    {
        const conditionResultTemporaryVariable = new SemanticSymbols.Variable('', conditionalGotoStatement.condition.type, false);

        const conditionResultLocation = this.pushVariable(conditionResultTemporaryVariable);

        // Transpile the condition with the condition result location as target location:
        this.transpileExpression(conditionalGotoStatement.condition, conditionResultLocation);

        // Go sure the variable is on the register because we need a register for comparisons:
        this.moveVariableToRegister(conditionResultLocation);

        const compareValue = conditionalGotoStatement.conditionResult ? '1' : '0';

        this.code.push(
            `cmp ${conditionResultLocation.locationString}, ${compareValue}`,
            `je ${conditionalGotoStatement.labelSymbol.name}`,
        );

        this.freeVariable(conditionResultTemporaryVariable);
    }

    private transpileExpression (expressionNode: SemanticNodes.Expression, targetLocation?: LocationedVariableAmd64): void
    {
        if (targetLocation === undefined)
        {
            switch (expressionNode.kind)
            {
                // TODO: Move this to the statement transpilation.

                case SemanticKind.CallExpression:
                    this.transpileCallExpression(expressionNode as SemanticNodes.CallExpression);
                    break;
                default:
                    throw new Error(`Transpile error: The expression of kind "${expressionNode.kind}" cannot be used as a statement.`);
            }
        }
        else
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
    }

    private transpileLiteralExpression (literalExpression: SemanticNodes.LiteralExpression, targetLocation: LocationedVariableAmd64): void
    {
        switch (literalExpression.type)
        {
            case BuildInTypes.int:
                this.code.push(`mov ${targetLocation.locationString}, ${literalExpression.value}`);
                break;
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
                    throw new Error(`Transpiler error: Unknown Bool value of "${literalExpression.value}"`);
                }

                this.code.push(`mov ${targetLocation.locationString}, ${value}`);

                break;
            }
            case BuildInTypes.string:
            {
                // We need an encoded string to get the real byte count:
                const encoder = new TextEncoder();
                const encodedString = encoder.encode(literalExpression.value);

                const constantLength = encodedString.length;

                const constantId = `c#${this.constantCounter}`;
                this.constantCounter++;

                // The string is a byte array prefixed with it's (platform dependent) length:
                this.constantCode.push(
                    `${constantId}:`,
                    `dq ${constantLength}`,
                    `db '${literalExpression.value}'`,
                );

                this.code.push(
                    `mov ${targetLocation.locationString}, ${constantId}`,
                );

                break;
            }
            default:
                throw new Error(`Transpiler error: Unknown literal of type "${literalExpression.type.name}".`);
        }
    }

    private transpileVariableExpression (variableExpression: SemanticNodes.VariableExpression, targetLocation: LocationedVariableAmd64): void
    {
        const variableLocation = this.getVariableLocation(variableExpression.variable);

        if (targetLocation.location !== variableLocation.location)
        {
            this.code.push(`mov ${targetLocation.locationString}, ${variableLocation.locationString}`);
        }
    }

    private transpileCallExpression (callExpression: SemanticNodes.CallExpression, targetLocation?: LocationedVariableAmd64): void
    {
        this.saveRegistersForFunctionCall(targetLocation);

        let argumentCounter = 0;
        for (const argument of callExpression.arguments)
        {
            if (argumentCounter >= RegistersAmd64Linux.integerArguments.length)
            {
                throw new Error('Transpiler error: Stack arguments are not supported.');
            }

            const register = RegistersAmd64Linux.integerArguments[argumentCounter];

            // The arguments will be treated as temporary variables:
            const locationedArgument = this.pushVariable(callExpression.functionSymbol.parameters[argumentCounter], register, true);

            // The argument is an expression that must be placed into the register for this parameter:
            this.transpileExpression(argument, locationedArgument);

            argumentCounter++;
        }

        this.code.push(`call ${callExpression.functionSymbol.name}`);

        // We must free the temporary variables again after the function call:
        for (const parameter of callExpression.functionSymbol.parameters)
        {
            this.freeVariable(parameter);
        }

        this.restoreRegistersAfterFunctionCall();

        if ((targetLocation !== undefined) && (targetLocation.location !== RegistersAmd64Linux.integerReturn))
        {
            // TODO: Replace hard coded return register with actual type and size:
            this.code.push(`mov ${targetLocation.locationString}, ${RegistersAmd64Linux.integerReturn.bit64}`);
        }

        if (callExpression.functionSymbol.isExternal)
        {
            this.importedFunctions.add(callExpression.functionSymbol);
        }
    }

    private transpileUnaryExpression (unaryExpression: SemanticNodes.UnaryExpression, targetLocation: LocationedVariableAmd64): void
    {
        this.transpileExpression(unaryExpression.operand, targetLocation);

        const operator = unaryExpression.operator;

        switch (operator)
        {
            case BuildInOperators.unaryIntAddition:
                // An unary addition has no effect.
                break;
            case BuildInOperators.unaryIntSubtraction:
                this.moveVariableToRegister(targetLocation);
                this.code.push(`neg ${targetLocation.locationString}`);
                break;
            default:
                throw new Error(
                    `Transpiler error: The operator "${operator.kind}" for operand of "${operator.operandType.name}" and ` +
                    `result of "${operator.resultType.name}" is not implemented.`
                );
        }
    }

    private transpileBinaryExpression (binaryExpression: SemanticNodes.BinaryExpression, targetLocation: LocationedVariableAmd64): void
    {
        const operator = binaryExpression.operator;

        // Temporary variable for the right operand:
        const temporaryVariable = new SemanticSymbols.Variable('', binaryExpression.rightOperand.type, false);
        const temporaryVariableLocation = this.pushVariable(temporaryVariable);

        this.transpileExpression(binaryExpression.leftOperand, targetLocation);
        this.transpileExpression(binaryExpression.rightOperand, temporaryVariableLocation);

        this.moveVariableToRegister(targetLocation);

        switch (operator)
        {
            case BuildInOperators.binaryIntAddition:
                this.code.push(`add ${targetLocation.locationString}, ${temporaryVariableLocation.locationString}`);
                break;
            case BuildInOperators.binaryIntSubtraction:
                this.code.push(`sub ${targetLocation.locationString}, ${temporaryVariableLocation.locationString}`);
                break;
            case BuildInOperators.binaryIntEqual:
            case BuildInOperators.binaryIntLess:
            case BuildInOperators.binaryIntGreater:
            {
                let operatorInstruction = 'je'; // BuildInOperators.binaryIntEqual

                switch (operator)
                {
                    case BuildInOperators.binaryIntLess:
                        operatorInstruction = 'jl';
                        break;
                    case BuildInOperators.binaryIntGreater:
                        operatorInstruction = 'jg';
                        break;
                }

                const trueLabel = this.nextLocalLabel;
                const endLabel = this.nextLocalLabel;

                this.code.push(
                    `cmp ${targetLocation.locationString}, ${temporaryVariableLocation.locationString}`,
                    `${operatorInstruction} ${trueLabel}`,
                    `mov ${targetLocation.locationString}, 0`,
                    `jmp ${endLabel}`,
                    `${trueLabel}:`,
                    `mov ${targetLocation.locationString}, 1`,
                    `${endLabel}:`,
                );

                break;
            }
            default:
                throw new Error(
                    `Transpiler error: The operator "${operator.kind}" for the operands of "${operator.leftType.name}" and ` +
                    `"${operator.rightType.name}" with the result type of "${operator.resultType.name}" is not implemented.`
                );
        }

        this.freeVariable(temporaryVariable);
    }
}
