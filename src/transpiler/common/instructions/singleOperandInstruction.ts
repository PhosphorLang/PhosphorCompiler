import { Instruction } from './instruction';

// TODO: This class should be fully replaced by Instruction.
export class SingleOperandInstruction extends Instruction
{
    constructor (command: string, operand: string)
    {
        super(command, operand);
    }
}
