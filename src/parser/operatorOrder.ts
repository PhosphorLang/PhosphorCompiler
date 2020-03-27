import Token from "../lexer/token";
import TokenKind from "../lexer/tokenKind";

export default abstract class OperatorOrder
{
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

    public static getBinaryPriority (token: Token): number
    {
        switch (token.kind)
        {
            case TokenKind.StarOperator:
            case TokenKind.SlashOperator:
                return 2;
            case TokenKind.PlusOperator:
            case TokenKind.MinusOperator:
                return 1;
            default:
                return 0;
        }
    }
}
