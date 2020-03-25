import SyntaxNode from "./syntaxNode";

export default abstract class ExpressionSyntaxNode extends SyntaxNode
{
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore Workaround to enable static typing for this class.
    private staticTyping = true;
}
