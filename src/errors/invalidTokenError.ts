import CompilerError from "./compilerError";
import Token from "../lexer/token";

export default class InvalidTokenError extends CompilerError
{
    constructor (message: string, token: Token)
    {
        super(message, token);
    }
}
