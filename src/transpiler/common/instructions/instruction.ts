export class Instruction
{
    public command: string;
    private operands: string[];

    public commandOperandSplitter: string|null = null;
    public operandSplitter: string|null = null;
    public postfix: string|null = null;

    constructor (command: string, ...operands: string[])
    {
        this.command = command;
        this.operands = operands;
    }

    /**
     * Render the instruction as a string. \
     * The splitters and the postfix are chosen by this order: \
     * 1. From the public properties. \
     * 2. From any given parameter. \
     * 3. From the default values. \
     * This allows to have defaults which are overwritten by a global render setting which can also be overwritten by individual
     * per-instruction settings.
     */
    public render (
        commandOperandSplitter: string = ' ',
        operandSplitter: string = ', ',
        postfix: string = '',
        indentation: string = ''
    ): string
    {
        const actualCommandOperandSplitter = this.commandOperandSplitter ?? commandOperandSplitter;
        const actualOperandSplitter = this.operandSplitter ?? operandSplitter;
        const actualPostfix = this.postfix ?? postfix;

        let operandsString = '';
        if (this.operands.length > 0)
        {
            operandsString = actualCommandOperandSplitter + this.operands.join(actualOperandSplitter);
        }

        return indentation + this.command + operandsString + actualPostfix;
    }
}
