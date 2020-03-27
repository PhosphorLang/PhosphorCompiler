import CompilerError from "./compilerError";
import Token from "../lexer/token";

export default class UnknownTokenError extends CompilerError
{
    /**
     * Thrown when a given token is unknown.
     * @param group The group of the token, e.g. "statement".
     * @param fileName The name/path of the file the error has happend in.
     * @param token The token the error referes to.
     */
    constructor (group: string, fileName: string, token: Token)
    {
        const message = `Unknown ${group} "${token.content}"`;

        super(message, fileName, token);
    }
}
