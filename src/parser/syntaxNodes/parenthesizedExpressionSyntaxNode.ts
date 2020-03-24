import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class ParenthesizedExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly openingToken: Token;
    public readonly expression: ExpressionSyntaxNode;
    public readonly closingToken: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return [this.expression];
    }

    constructor (openingToken: Token, expression: ExpressionSyntaxNode, closingToken: Token)
    {
        super(SyntaxType.ParenthesizedExpression);

        this.openingToken = openingToken;
        this.expression = expression;
        this.closingToken = closingToken;
    }
}
