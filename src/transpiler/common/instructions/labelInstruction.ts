import { Instruction } from './instruction';

export class LabelInstruction extends Instruction
{
    constructor (text: string)
    {
        super(text);

        this.renderOptions = {
            commandOperandSplitter: '',
            operandSplitter: '',
            prefix: '',
            postfix: ':',
        };
    }
}
