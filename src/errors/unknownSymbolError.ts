import BaseCompilerError from "./baseCompilerError";
import LineInformation from "../definitions/lineInformation";

export default class UnknownSymbolError extends BaseCompilerError
{
    constructor (symbol: string, fileName: string, lineInformation: LineInformation)
    {
        const message = `Unknown symbol "${symbol}"`;

        super(message, 'UnknownSymbolError', fileName, lineInformation);
    }
}
