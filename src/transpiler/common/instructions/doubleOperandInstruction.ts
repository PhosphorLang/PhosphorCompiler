import Instruction from "./instruction";

export default class DoubleOperandInstruction extends Instruction
{
    protected readonly commandOperandSplitter = ' ';
    protected readonly operandSplitter = ', ';

    public firstOperand: string;
    public secondOperand: string;

    public override get text (): string
    {
        return this.commandString + this.commandOperandSplitter + this.firstOperand + this.operandSplitter + this.secondOperand;
    }

    constructor (command: string, firstOperand: string, secondOperand: string)
    {
        super(command);

        this.firstOperand = firstOperand;
        this.secondOperand = secondOperand;
    }
}
