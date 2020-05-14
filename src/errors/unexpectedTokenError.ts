import CompilerError from "./compilerError";
import Token from "../lexer/token";

export default class UnexpectedTokenError extends CompilerError
{
    /**
     * Thrown when a given token is unexpected.
     * @param after The thing/type/tokenContent after which the unexpected token has been found, e.g. "identifier".
     * @param token The token the error referes to.
     */
    constructor (after: string, token: Token)
    {
        const message = `Unexpected token "${token.content}" after ${after}`;

        super(message, token);
    }
}
