import ArgumentsSyntaxNode from "./argumentsSyntaxNode";
import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class CallExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly identifier: Token;
    public readonly opening: Token;
    public readonly arguments: ArgumentsSyntaxNode;
    public readonly closing: Token;

    constructor (identifier: Token, opening: Token, callArguments: ArgumentsSyntaxNode, closing: Token)
    {
        super(SyntaxType.CallExpression);

        this.identifier = identifier;
        this.opening = opening;
        this.arguments = callArguments;
        this.closing = closing;

        this.children.push(callArguments);
    }
}
