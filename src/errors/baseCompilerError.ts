import LineInformation from "../definitions/lineInformation";

export default abstract class BaseCompilerError extends Error
{
    constructor (message: string, lineInformation: LineInformation)
    {
        const fullMessage = message + ` at line ${lineInformation.line}, ${lineInformation.column}`;

        super(fullMessage);
    }
}
