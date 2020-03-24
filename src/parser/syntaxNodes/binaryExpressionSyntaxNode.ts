import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class BinaryExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly leftSide: ExpressionSyntaxNode;
    public readonly operator: Token;
    public readonly rightSide: ExpressionSyntaxNode;

    public get children (): Iterable<SyntaxNode>
    {
        return [this.leftSide, this.rightSide];
    }

    constructor (leftSide: ExpressionSyntaxNode, operator: Token, rightSide: ExpressionSyntaxNode)
    {
        super(SyntaxType.BinaryExpression);

        this.leftSide = leftSide;
        this.operator = operator;
        this.rightSide = rightSide;
    }
}
