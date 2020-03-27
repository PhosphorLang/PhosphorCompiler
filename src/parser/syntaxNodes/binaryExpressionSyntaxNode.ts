import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";
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
        super(SyntaxKind.BinaryExpression);

        this.leftSide = leftSide;
        this.operator = operator;
        this.rightSide = rightSide;
    }
}
