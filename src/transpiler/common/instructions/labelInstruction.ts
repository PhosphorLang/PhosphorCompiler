import Instruction from "./instruction";

export default class LabelInstruction extends Instruction
{
    protected readonly postfix = ':';

    public get text (): string
    {
        return this._command + this.postfix;
    }
}
