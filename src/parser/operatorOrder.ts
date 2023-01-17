import { Token } from '../lexer/token';
import { TokenKind } from '../lexer/tokenKind';

export abstract class OperatorOrder
{
    /**
     * Get the unary token priority for a given token. \
     * The higher the number the higher the priority.
     */
    public static getUnaryPriority (token: Token): number
    {
        // TODO: As all unary operators are prefix operators, has the priority any meaning?

        switch (token.kind)
        {
            case TokenKind.NotOperator:
                return 20;
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
            // Mathematical operators:
            case TokenKind.StarOperator:
            case TokenKind.SlashOperator:
            case TokenKind.PercentOperator:
                return 6;
            case TokenKind.PlusOperator:
            case TokenKind.MinusOperator:
                return 5;
            // Logical/Bitwise operators:
            case TokenKind.NotOperator:
                return 4;
            case TokenKind.AndOperator:
                return 3;
            case TokenKind.OrOperator:
                return 2;
            // Comparison operators:
            case TokenKind.EqualOperator:
            case TokenKind.NotEqualOperator:
            case TokenKind.LessOperator:
            case TokenKind.GreaterOperator:
                return 1;
            // Default:
            default:
                return 0;
        }
    }
}
