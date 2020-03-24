import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class LiteralExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly literal: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return [];
    }

    constructor (literal: Token)
    {
        super(SyntaxType.LiteralExpression);

        this.literal = literal;
    }
}
