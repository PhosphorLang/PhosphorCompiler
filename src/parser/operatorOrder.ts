import Token from '../lexer/token';
import TokenKind from '../lexer/tokenKind';

export default abstract class OperatorOrder
{
    /**
     * Get the unary token priority for a given token. \
     * The higher the number the higher the priority.
     */
    public static getUnaryPriority (token: Token): number
    {
        switch (token.kind)
        {
            case TokenKind.PlusOperator:
            case TokenKind.MinusOperator:
                return 10;
            default:
                return 0;
        }
    }

    /**
     * Get the binary token priority for a given token. \
     * The higher the number the higher the priority.
     */
    public static getBinaryPriority (token: Token): number
    {
        switch (token.kind)
        {
            case TokenKind.StarOperator:
            case TokenKind.SlashOperator:
                return 3;
            case TokenKind.PlusOperator:
            case TokenKind.MinusOperator:
                return 2;
            case TokenKind.EqualOperator:
            case TokenKind.LessOperator:
            case TokenKind.GreaterOperator:
                return 1;
            default:
                return 0;
        }
    }
}
