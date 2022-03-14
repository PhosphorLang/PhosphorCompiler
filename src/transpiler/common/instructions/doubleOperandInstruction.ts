import { Instruction } from './instruction';

// TODO: This class should be fully replaced by Instruction.
export class DoubleOperandInstruction extends Instruction
{
    constructor (command: string, firstOperand: string, secondOperand: string)
    {
        super(command, firstOperand, secondOperand);
    }
}
