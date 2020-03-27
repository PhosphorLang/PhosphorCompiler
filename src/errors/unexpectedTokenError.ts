import CompilerError from "./compilerError";
import Token from "../lexer/token";

export default class UnexpectedTokenError extends CompilerError
{
    /**
     * Thrown when a given token is unexpected.
     * @param after The thing/type/tokenContent after which the unexpected token has been found, e.g. "identifier".
     * @param fileName The name/path of the file the error has happend in.
     * @param token The token the error referes to.
     */
    constructor (after: string, fileName: string, token: Token)
    {
        const message = `Unexpected token "${token.content}" after ${after}`;

        super(message, fileName, token);
    }
}
