import { Instruction } from './instruction';

export class DoubleOperandInstruction extends Instruction
{
    /**
     * @deprecated TODO: This class should be fully replaced by Instruction.
    */
    constructor (command: string, firstOperand: string, secondOperand: string)
    {
        super(command, firstOperand, secondOperand);
    }
}
