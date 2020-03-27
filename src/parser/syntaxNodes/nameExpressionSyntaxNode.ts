import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";
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
        super(SyntaxKind.NameExpression);

        this.identifier = identifier;
    }
}
