import * as Instructions from '../common/instructions';
import * as Intermediates from '../../lowerer/intermediates';
import { BackseatLabelInstruction } from './backseatLabelInstruction';
import { Transpiler } from '../transpiler';

export class TranspilerBackseat implements Transpiler
{
    private instructions: Instructions.Instruction[];

    constructor ()
    {
        this.instructions = [];
    }

    public run (fileIntermediate: Intermediates.File): string
    {
        this.instructions.push(
            // The start routine calls main and then exits properly:
            new BackseatLabelInstruction('::main()'), // Differes in the programme main by being the only function in global scope.
            //new Instructions.Instruction('CALL', '$"' + this.encodeFunctionName('main') + '"'),
            new Instructions.Instruction('HALT'),
        );

        this.transpileFile(fileIntermediate);

        const fileAssembly = this.convertInstructionsToAssembly(this.instructions);

        this.instructions = [];

        return fileAssembly;
    }

    private convertInstructionsToAssembly (instructions: Instructions.Instruction[]): string
    {
        /** Render options for simple NASM Assembly statements */
        const statementRenderOptions: Instructions.RenderOptions = {
            commandOperandSplitter: ' ',
            operandSplitter: ', ',
            prefix: '',
            postfix: '',
        };

        let assembly = '';

        for (const instruction of instructions)
        {
            assembly += instruction.render(statementRenderOptions) + '\n';
        }

        return assembly;
    }

    private encodeFunctionName (functionName: string): string
    {
        return '::main::' + functionName + '()';
    }

    private transpileFile (fileIntermediate: Intermediates.File): void
    {
        // TODO: Transpile constants

        // TODO: Check for external functions; all of them must be part of the standard library (for now).

        for (const functionIntermediate of fileIntermediate.functions)
        {
            this.transpileFunction(functionIntermediate);
        }
    }

    private transpileFunction (functionIntermediate: Intermediates.Function): void
    {
        const encodedFunctionName = this.encodeFunctionName(functionIntermediate.symbol.name);

        this.instructions.push(
            new BackseatLabelInstruction(encodedFunctionName),
        );

        for (const instruction of functionIntermediate.body)
        {
            this.transpileStatement(instruction);
        }

    }

    private transpileStatement (statementIntermediate: Intermediates.Statement): void
    {
        switch (statementIntermediate.kind)
        {
            default:
                // TODO: Do not ignore everything...
                return;
        }
    }
}
