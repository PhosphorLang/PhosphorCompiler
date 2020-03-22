import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class UnaryExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly operator: Token;
    public readonly operand: ExpressionSyntaxNode;

    constructor (operator: Token, operand: ExpressionSyntaxNode)
    {
        super(SyntaxType.UnaryExpression);

        this.operator = operator;
        this.operand = operand;

        this.children.push(operand);
    }
}
