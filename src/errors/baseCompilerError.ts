import LineInformation from "../definitions/lineInformation";

export default abstract class BaseCompilerError extends Error
{
    constructor (message: string, errorType: string, fileName: string, lineInformation: LineInformation)
    {
        const fullMessage = `${fileName}:${lineInformation.line}:${lineInformation.column} - ${errorType}: ${message}`;

        super(fullMessage);
    }
}
