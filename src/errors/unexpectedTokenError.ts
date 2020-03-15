import BaseCompilerError from "./baseCompilerError";
import Token from "../lexer/token";

export default class UnexpectedTokenError extends BaseCompilerError
{
    /**
     * Thrown when a given token is unexpected.
     * @param after The thing/type/tokenContent after which the unexpected token has been found, e.g. "identifier".
     * @param fileName The name/path of the file the error has happend in.
     * @param token The token the error referes to.
     */
    constructor (after: string, fileName: string, token: Token)
    {
        const message = `Unknown token "${token.content}" after ${after}`;

        super(message, fileName, token);
    }
}
