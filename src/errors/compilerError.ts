import chalk from "chalk";
import LineInformation from "../definitions/lineInformation";

export default class CompilerError extends Error
{
    constructor (message: string, lineInformation: LineInformation)
    {
        const fullMessage =
            chalk.blueBright(lineInformation.fileName) + ':' +
            chalk.yellowBright(lineInformation.lineNumber) + ':' +
            chalk.yellowBright(lineInformation.columnNumber) + ' - ' +
            chalk.redBright('Error') + ': ' +
            message + '.';

        super(fullMessage);
    }
}
