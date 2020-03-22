import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class NameExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly identifier: Token;

    constructor (identifier: Token)
    {
        super(SyntaxType.NameExpression);

        this.identifier = identifier;
    }
}
