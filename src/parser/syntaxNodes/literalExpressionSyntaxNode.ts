import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class LiteralExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly literal: Token;

    constructor (literal: Token)
    {
        super(SyntaxType.LiteralExpression);

        this.literal = literal;
    }
}
