import CompilerError from "./compilerError";
import LineInformation from "../definitions/lineInformation";

export default class UnknownSymbolError extends CompilerError
{
    constructor (symbol: string, fileName: string, lineInformation: LineInformation)
    {
        const message = `Unknown symbol "${symbol}"`;

        super(message, fileName, lineInformation);
    }
}
