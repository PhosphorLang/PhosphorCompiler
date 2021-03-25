import Instruction from "./instruction";

export default class SingleOperandInstruction extends Instruction
{
    protected readonly commandOperandSplitter = ' ';

    protected operand: string;

    public get text (): string
    {
        return this.commandString + this.commandOperandSplitter + this.operand;
    }

    constructor (command: string, operand: string)
    {
        super(command);

        this.operand = operand;
    }
}
