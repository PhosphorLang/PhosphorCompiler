import * as Instructions from '../common/instructions';
import * as Intermediates from '../../lowerer/intermediates';
import { IntermediateKind } from '../../lowerer/intermediateKind';
import Transpiler from '../transpiler';

export default class TranspilerIntermediate implements Transpiler
{
    private instructions: Instructions.Instruction[];

    constructor ()
    {
        this.instructions = [];
    }

    public run (fileIntermediate: Intermediates.File): string
    {
        this.instructions = [];

        this.transpileFile(fileIntermediate);

        const fileText = this.convertInstructionsToText(this.instructions);

        return fileText;
    }

    private convertInstructionsToText (instructions: Instructions.Instruction[]): string
    {
        let text = '';
        let indentation = '';

        for (const instruction of instructions)
        {
            if (instruction.command == '}')
            {
                indentation = indentation.slice(4);
            }

            text += instruction.render(' ', ' ', '', indentation) + "\n";

            if (instruction.command == '{')
            {
                indentation += '    ';
            }
        }

        return text;
    }

    private getIntermediateInstructionString (intermediate: Intermediates.Intermediate): string
    {
        switch (intermediate.kind)
        {
            case IntermediateKind.Function:
                return 'function';
            case IntermediateKind.Constant:
                return 'constant';
            case IntermediateKind.External:
                return 'external';
            case IntermediateKind.Add:
                return 'add';
            case IntermediateKind.Call:
                return 'call';
            case IntermediateKind.Compare:
                return 'compare';
            case IntermediateKind.Dismiss:
                return 'dismiss';
            case IntermediateKind.Goto:
                return 'goto';
            case IntermediateKind.Introduce:
                return 'introduce';
            case IntermediateKind.JumpIfEqual:
                return 'jumpIfEqual';
            case IntermediateKind.JumpIfGreater:
                return 'jumpIfGreater';
            case IntermediateKind.JumpIfLess:
                return 'jumpIfLess';
            case IntermediateKind.Move:
                return 'move';
            case IntermediateKind.Negate:
                return 'negate';
            case IntermediateKind.Parameterise:
                return 'parameterise';
            case IntermediateKind.Receive:
                return 'receive';
            case IntermediateKind.Return:
                return 'return';
            case IntermediateKind.Subtract:
                return 'subtract';
            case IntermediateKind.File:
            case IntermediateKind.Label:
                throw new Error(`Transpiler error: Intermediate kind "${intermediate.kind}" is not supported or has no instruction string.`);
        }
    }

    private transpileFile (fileIntermediate: Intermediates.File): void
    {
        for (const constant of fileIntermediate.constants)
        {
            this.transpileConstant(constant);
        }

        if (fileIntermediate.constants.length > 0)
        {
            this.instructions.push(
                new Instructions.Instruction('') // Empty line
            );
        }

        for (const external of fileIntermediate.externals)
        {
            this.transpileExternal(external);
        }

        if (fileIntermediate.externals.length > 0)
        {
            this.instructions.push(
                new Instructions.Instruction('') // Empty line
            );
        }

        for (const functionNode of fileIntermediate.functions)
        {
            this.transpileFunction(functionNode);
        }
    }

    private transpileConstant (constantIntermediate: Intermediates.Constant): void
    {
        // TODO: This assumes that constants are always strings. Must be adjusted as soon as constants get a type (other than string only).
        const instruction = new Instructions.Instruction(
            this.getIntermediateInstructionString(constantIntermediate),
            constantIntermediate.symbol.name,
            '"' + constantIntermediate.symbol.value + '"',
        );

        this.instructions.push(instruction);
    }

    private transpileExternal (externalIntermediate: Intermediates.External): void
    {
        const instruction = new Instructions.Function(
            this.getIntermediateInstructionString(externalIntermediate),
            externalIntermediate.symbol.name,
            externalIntermediate.symbol.parameters,
            externalIntermediate.symbol.returnSize
        );

        this.instructions.push(instruction);
    }

    private transpileFunction (functionIntermediate: Intermediates.Function): void
    {
        const instruction = new Instructions.Function(
            this.getIntermediateInstructionString(functionIntermediate),
            functionIntermediate.symbol.name,
            functionIntermediate.symbol.parameters,
            functionIntermediate.symbol.returnSize
        );

        this.instructions.push(
            instruction,
            new Instructions.Instruction('{'),
        );

        for (const instruction of functionIntermediate.body)
        {
            this.transpileStatement(instruction);
        }

        this.instructions.push(
            new Instructions.Instruction('}'),
        );
    }

    private transpileStatement (statementIntermediate: Intermediates.Statement): void
    {
        let parameters: string[];

        switch (statementIntermediate.kind)
        {
            case IntermediateKind.Add:
            case IntermediateKind.Compare:
            case IntermediateKind.Subtract:
                parameters = [
                    statementIntermediate.leftOperand.name,
                    statementIntermediate.rightOperand.name,
                ];
                break;
            case IntermediateKind.Call:
                parameters = [
                    statementIntermediate.functionSymbol.name,
                ];
                break;
            case IntermediateKind.Dismiss:
            case IntermediateKind.Introduce:
                parameters = [
                    statementIntermediate.variableSymbol.name,
                ];
                break;
            case IntermediateKind.Goto:
            case IntermediateKind.JumpIfEqual:
            case IntermediateKind.JumpIfGreater:
            case IntermediateKind.JumpIfLess:
                parameters = [
                    statementIntermediate.target.name,
                ];
                break;
            case IntermediateKind.Move:
                parameters = [
                    statementIntermediate.to.name,
                    statementIntermediate.from.name,
                ];
                break;
            case IntermediateKind.Negate:
                parameters = [
                    statementIntermediate.operand.name,
                ];
                break;
            case IntermediateKind.Parameterise:
                parameters = [
                    statementIntermediate.parameterSymbol.name,
                    statementIntermediate.readableValue.name,
                ];
                break;
            case IntermediateKind.Receive:
                parameters = [
                    statementIntermediate.variableSymbol.name,
                    statementIntermediate.receivableValue.name,
                ];
                break;
            case IntermediateKind.Return:
                if (statementIntermediate.value === null)
                {
                    parameters = [];
                }
                else
                {
                    parameters = [
                        statementIntermediate.value.name,
                    ];
                }
                break;

            case IntermediateKind.Label:
                this.instructions.push(
                    new Instructions.Label(
                        statementIntermediate.symbol.name,
                    ),
                );
                return;
        }

        this.instructions.push(
            new Instructions.Instruction(
                this.getIntermediateInstructionString(statementIntermediate),
                ...parameters,
            ),
        );
    }
}
