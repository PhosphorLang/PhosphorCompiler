import { Instruction } from './instruction';

export class LabelInstruction extends Instruction
{
    constructor (text: string)
    {
        super(text);

        this.postfix = ':';
    }
}
