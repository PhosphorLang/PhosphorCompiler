import SyntaxKind from '../syntaxKind';

export default abstract class SyntaxNode
{
    public readonly kind: SyntaxKind;

    public abstract get children (): Iterable<SyntaxNode>;

    constructor (kind: SyntaxKind)
    {
        this.kind = kind;
    }
}
