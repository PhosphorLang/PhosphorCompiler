import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";
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
        super(SyntaxKind.LiteralExpression);

        this.literal = literal;
    }
}
