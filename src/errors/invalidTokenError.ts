import CompilerError from "./compilerError";
import Token from "../lexer/token";

export default class InvalidTokenError extends CompilerError
{
    constructor (message: string, fileName: string, token: Token)
    {
        super(message, fileName, token);
    }
}
