import SyntaxType from "../syntaxType";

export default abstract class SyntaxNode
{
    public readonly type: SyntaxType;

    public abstract get children (): Iterable<SyntaxNode>;

    constructor (type: SyntaxType)
    {
        this.type = type;
    }
}
