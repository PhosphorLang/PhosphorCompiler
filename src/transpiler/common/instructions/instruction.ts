export default class Instruction
{
    protected commandString: string;

    public get text (): string
    {
        return this.commandString;
    }

    public set command (command: string)
    {
        this.commandString = command;
    }

    constructor (command: string)
    {
        this.commandString = command;
    }
}
