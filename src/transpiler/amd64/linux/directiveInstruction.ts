import * as Instructions from '../../common/instructions';

/**
 * An instruction with its render options set according to NASM Assembler directives
 */
export class DirectiveInstruction extends Instructions.Instruction
{
    constructor (command: string, ...operands: string[])
    {
        super(command, ...operands);

        this.renderOptions = {
            commandOperandSplitter: ' ',
            operandSplitter: ' ',
            prefix: '[',
            postfix: ']',
        };
    }
}
