import BaseCompilerError from "./baseCompilerError";
import Token from "../lexer/token";

export default class InvalidTokenError extends BaseCompilerError
{
    constructor (message: string, fileName: string, token: Token)
    {
        super(message, 'InvalidTokenError', fileName, token);
    }
}
