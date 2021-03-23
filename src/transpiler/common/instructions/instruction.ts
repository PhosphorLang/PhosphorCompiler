export default class Instruction
{
    protected _command: string;

    public get text (): string
    {
        return this._command;
    }

    public set command (command: string)
    {
        this._command = command;
    }

    constructor (command: string)
    {
        this._command = command;
    }
}
