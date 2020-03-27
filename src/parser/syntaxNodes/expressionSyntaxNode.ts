import SyntaxNode from "./syntaxNode";

export default abstract class ExpressionSyntaxNode extends SyntaxNode
{
    // @ts-ignore Workaround to enable static typing for this class.
    private staticTyping = true;
}
