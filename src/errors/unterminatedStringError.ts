import BaseCompilerError from "./baseCompilerError";
import LineInformation from "../definitions/lineInformation";

export default class UnterminatedStringError extends BaseCompilerError
{
    constructor (fileName: string, lineInformation: LineInformation)
    {
        const message = 'Unterminated string';

        super(message, fileName, lineInformation);
    }
}
