import { Instruction } from './instruction';

export class SingleOperandInstruction extends Instruction
{
    /**
     * @deprecated TODO: This class should be fully replaced by Instruction.
    */
    constructor (command: string, operand: string)
    {
        super(command, operand);
    }
}
