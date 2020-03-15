import chalk from "chalk";
import LineInformation from "../definitions/lineInformation";

export default abstract class BaseCompilerError extends Error
{
    constructor (message: string, fileName: string, lineInformation: LineInformation)
    {
        const fullMessage =
            chalk.blueBright(fileName) + ':' +
            chalk.yellowBright(lineInformation.line) + ':' +
            chalk.yellowBright(lineInformation.column) + ' - ' +
            chalk.redBright('Error') + ': ' +
            message + '.';

        super(fullMessage);
    }
}
