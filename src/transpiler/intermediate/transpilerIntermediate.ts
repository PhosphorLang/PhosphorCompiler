import * as Instructions from '../common/instructions';
import * as Intermediates from '../../lowerer/intermediates';
import { IntermediateKind } from '../../lowerer/intermediateKind';
import { IntermediateSymbol } from '../../lowerer/intermediateSymbols';
import { IntermediateSymbolKind } from '../../lowerer/intermediateSymbolKind';

export class TranspilerIntermediate
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

            const renderOptions: Instructions.RenderOptions = {
                commandOperandSplitter: ' ',
                operandSplitter: ' ',
                prefix: '',
                postfix: '',
            };

            text += instruction.render(renderOptions, indentation) + '\n';

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
            case IntermediateKind.Global:
                return 'global';
            case IntermediateKind.Add:
                return 'add';
            case IntermediateKind.And:
                return 'and';
            case IntermediateKind.Call:
                return 'call';
            case IntermediateKind.Compare:
                return 'compare';
            case IntermediateKind.Dismiss:
                return 'dismiss';
            case IntermediateKind.Divide:
                return 'divide';
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
            case IntermediateKind.JumpIfNotEqual:
                return 'jumpIfNotEqual';
            case IntermediateKind.Modulo:
                return 'modulo';
            case IntermediateKind.Move:
                return 'move';
            case IntermediateKind.Multiply:
                return 'multiply';
            case IntermediateKind.Negate:
                return 'negate';
            case IntermediateKind.Not:
                return 'not';
            case IntermediateKind.Or:
                return 'or';
            case IntermediateKind.Give:
                return 'give';
            case IntermediateKind.Take:
                return 'take';
            case IntermediateKind.Return:
                return 'return';
            case IntermediateKind.Subtract:
                return 'subtract';
            case IntermediateKind.File:
            case IntermediateKind.Label:
                throw new Error(`Transpiler error: Intermediate kind "${intermediate.kind}" is not supported or has no instruction string.`);
        }
    }

    private getIntermediateSymbolString (intermediateSymbol: IntermediateSymbol): string
    {
        if (intermediateSymbol.kind == IntermediateSymbolKind.Literal)
        {
            const symbolString = `${intermediateSymbol.size}(${intermediateSymbol.name})`;

            return symbolString;
        }
        else
        {
            return intermediateSymbol.name;
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

        for (const global of fileIntermediate.globals)
        {
            this.transpileGlobal(global);
        }

        if (fileIntermediate.globals.length > 0)
        {
            this.instructions.push(
                new Instructions.Instruction('') // Empty line
            );
        }

        for (const functionNode of fileIntermediate.functions)
        {
            this.transpileFunction(functionNode);

            if (functionNode !== fileIntermediate.functions.at(-1))
            {
                this.instructions.push(
                    new Instructions.Instruction('') // Empty line
                );
            }
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

    private transpileGlobal (globalIntermediate: Intermediates.Global): void
    {
        const instruction = new Instructions.Instruction(
            this.getIntermediateInstructionString(globalIntermediate),
            globalIntermediate.symbol.name + ':',
            globalIntermediate.symbol.size,
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
            case IntermediateKind.And:
            case IntermediateKind.Compare:
            case IntermediateKind.Subtract:
            case IntermediateKind.Multiply:
            case IntermediateKind.Divide:
            case IntermediateKind.Modulo:
            case IntermediateKind.Or:
                parameters = [
                    this.getIntermediateSymbolString(statementIntermediate.leftOperand),
                    this.getIntermediateSymbolString(statementIntermediate.rightOperand),
                ];
                break;
            case IntermediateKind.Call:
                parameters = [
                    this.getIntermediateSymbolString(statementIntermediate.functionSymbol),
                ];
                break;
            case IntermediateKind.Dismiss:
            case IntermediateKind.Introduce:
                parameters = [
                    this.getIntermediateSymbolString(statementIntermediate.variableSymbol),
                ];
                break;
            case IntermediateKind.Goto:
            case IntermediateKind.JumpIfEqual:
            case IntermediateKind.JumpIfGreater:
            case IntermediateKind.JumpIfLess:
            case IntermediateKind.JumpIfNotEqual:
                parameters = [
                    this.getIntermediateSymbolString(statementIntermediate.target),
                ];
                break;
            case IntermediateKind.Move:
                parameters = [
                    this.getIntermediateSymbolString(statementIntermediate.to),
                    this.getIntermediateSymbolString(statementIntermediate.from),
                ];
                break;
            case IntermediateKind.Negate:
            case IntermediateKind.Not:
                parameters = [
                    this.getIntermediateSymbolString(statementIntermediate.operand),
                ];
                break;
            case IntermediateKind.Give:
                parameters = [
                    this.getIntermediateSymbolString(statementIntermediate.targetSymbol),
                    this.getIntermediateSymbolString(statementIntermediate.variable),
                ];
                break;
            case IntermediateKind.Take:
                parameters = [
                    this.getIntermediateSymbolString(statementIntermediate.variableSymbol),
                    this.getIntermediateSymbolString(statementIntermediate.takableValue),
                ];
                break;
            case IntermediateKind.Return:
                parameters = [];
                break;

            case IntermediateKind.Label:
                this.instructions.push(
                    new Instructions.Label(
                        this.getIntermediateSymbolString(statementIntermediate.symbol),
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
