import chalk from 'chalk';
import { LineInformation } from '../definitions/lineInformation';

export abstract class DiagnosticMessage
{
    protected readonly type: string;
    protected readonly text: string;
    protected readonly lineInformation: LineInformation;

    public readonly code: string;

    public get message (): string
    {
        const result =
            chalk.blueBright(this.lineInformation.fileName) + ':' +
            chalk.yellowBright(this.lineInformation.lineNumber) + ':' +
            chalk.yellowBright(this.lineInformation.columnNumber) + ' - ' +
            this.type + ' ' +
            chalk.magenta(this.code) + ': ' +
            this.text;

        return result;
    }

    /**
     * @param type The type of the message (e.g. "Error" or "Warning"), can be coloured.
     * @param code The diagnostic code of the message. Must not be coloured.
     * @param text The text of the message. Should not be coloured.
     * @param lineInformation The line information with the location the message applies to.
     */
    constructor (type: string, code: string, text: string, lineInformation: LineInformation)
    {
        this.type = type;
        this.code = code;
        this.text = text;
        this.lineInformation = lineInformation;
    }
}
