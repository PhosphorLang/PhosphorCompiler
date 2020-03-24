import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class NameExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly identifier: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return [];
    }

    constructor (identifier: Token)
    {
        super(SyntaxType.NameExpression);

        this.identifier = identifier;
    }
}
