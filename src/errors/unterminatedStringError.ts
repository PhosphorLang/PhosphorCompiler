import CompilerError from "./compilerError";
import LineInformation from "../definitions/lineInformation";

export default class UnterminatedStringError extends CompilerError
{
    constructor (fileName: string, lineInformation: LineInformation)
    {
        const message = 'Unterminated string';

        super(message, fileName, lineInformation);
    }
}
