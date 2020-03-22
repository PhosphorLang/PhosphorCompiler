import Token from "../lexer/token";
import TokenType from "../lexer/tokenType";

export default abstract class OperatorOrder
{
    public static getUnaryPriority (token: Token): number
    {
        switch (token.type)
        {
            case TokenType.PlusOperator:
            case TokenType.MinusOperator:
                return 10;
            default:
                return 0;
        }
    }

    public static getBinaryPriority (token: Token): number
    {
        switch (token.type)
        {
            case TokenType.StarOperator:
            case TokenType.SlashOperator:
                return 2;
            case TokenType.PlusOperator:
            case TokenType.MinusOperator:
                return 1;
            default:
                return 0;
        }
    }
}
