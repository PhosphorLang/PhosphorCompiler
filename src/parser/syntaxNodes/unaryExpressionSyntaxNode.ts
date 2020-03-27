import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";
import Token from "../../lexer/token";

export default class UnaryExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly operator: Token;
    public readonly operand: ExpressionSyntaxNode;

    public get children (): Iterable<SyntaxNode>
    {
        return [this.operand];
    }

    constructor (operator: Token, operand: ExpressionSyntaxNode)
    {
        super(SyntaxKind.UnaryExpression);

        this.operator = operator;
        this.operand = operand;
    }
}
