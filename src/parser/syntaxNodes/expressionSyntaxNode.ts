import SyntaxNode from "./syntaxNode";
import Token from "../../lexer/token";

export default abstract class ExpressionSyntaxNode extends SyntaxNode
{
    // @ts-ignore Workaround to enable static typing for this class.
    private staticTyping = true;

    public abstract get token (): Token;
}
