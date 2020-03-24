import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
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
        super(SyntaxType.UnaryExpression);

        this.operator = operator;
        this.operand = operand;
    }
}
