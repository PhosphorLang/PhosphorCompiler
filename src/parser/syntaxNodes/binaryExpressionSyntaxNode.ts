import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class BinaryExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly leftSide: ExpressionSyntaxNode;
    public readonly operator: Token;
    public readonly rightSide: ExpressionSyntaxNode;

    constructor (leftSide: ExpressionSyntaxNode, operator: Token, rightSide: ExpressionSyntaxNode)
    {
        super(SyntaxType.BinaryExpression);

        this.leftSide = leftSide;
        this.operator = operator;
        this.rightSide = rightSide;

        this.children.push(leftSide, rightSide);
    }
}
