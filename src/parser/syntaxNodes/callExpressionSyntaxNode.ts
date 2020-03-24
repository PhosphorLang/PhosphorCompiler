import CallArgumentsList from "../callArgumentsList";
import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class CallExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly identifier: Token;
    public readonly opening: Token;
    public readonly arguments: CallArgumentsList;
    public readonly closing: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return this.arguments.expressions;
    }

    constructor (identifier: Token, opening: Token, callArguments: CallArgumentsList, closing: Token)
    {
        super(SyntaxType.CallExpression);

        this.identifier = identifier;
        this.opening = opening;
        this.arguments = callArguments;
        this.closing = closing;
    }
}
