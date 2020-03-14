import BaseCompilerError from "./baseCompilerError";
import Token from "../lexer/token";

export default class UnknownTokenError extends BaseCompilerError
{
    /**
     * Thrown when a given token is unknown.
     * @param type The type of the token, e.g. "statement".
     * @param fileName The name/path of the file the error has happend in.
     * @param token The token the error referes to.
     */
    constructor (type: string, fileName: string, token: Token)
    {
        const message = `Unknown ${type} "${token.content}"`;

        super(message, 'UnknownTokenError', fileName, token);
    }
}
