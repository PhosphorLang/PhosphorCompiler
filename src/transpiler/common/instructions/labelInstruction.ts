import { Instruction } from './instruction';

export default class LabelInstruction extends Instruction
{
    constructor (text: string)
    {
        super(text);

        this.postfix = ':';
    }
}
