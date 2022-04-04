import { RenderOptions } from './renderOptions';

export class Instruction
{
    public command: string;
    private operands: string[];

    private commandOperandSplitter: string|null = null;
    private operandSplitter: string|null = null;
    private prefix: string|null = null;
    private postfix: string|null = null;

    public set renderOptions (renderOptions: RenderOptions)
    {
        this.commandOperandSplitter = renderOptions.commandOperandSplitter;
        this.operandSplitter = renderOptions.operandSplitter;
        this.prefix = renderOptions.prefix;
        this.postfix = renderOptions.postfix;
    }

    public get renderOptions (): RenderOptions
    {
        return {
            commandOperandSplitter: this.commandOperandSplitter,
            operandSplitter: this.operandSplitter,
            prefix: this.prefix,
            postfix: this.postfix,
        };
    }

    constructor (command: string, ...operands: string[])
    {
        this.command = command;
        this.operands = operands;
    }

    /**
     * Render the instruction as a string. \
     * The renderOptions are chosen by this order: \
     * 1. From the renderOptions property. \
     * 2. From the given renderOptions parameter. \
     * 3. From the default values. \
     * This allows to have defaults which are overwritten by a global render setting which can also be overwritten by individual
     * per-instruction settings.
     */
    public render (renderOptions?: RenderOptions, indentation = ''): string
    {
        const actualCommandOperandSplitter = this.commandOperandSplitter ?? renderOptions?.commandOperandSplitter ?? ' ';
        const actualOperandSplitter = this.operandSplitter ?? renderOptions?.operandSplitter ?? ', ';
        const actualPrefix = this.prefix ?? renderOptions?.prefix ?? '';
        const actualPostfix = this.postfix ?? renderOptions?.postfix ?? '';

        let operandsString = '';
        if (this.operands.length > 0)
        {
            operandsString = actualCommandOperandSplitter + this.operands.join(actualOperandSplitter);
        }

        return indentation + actualPrefix + this.command + operandsString + actualPostfix;
    }
}
