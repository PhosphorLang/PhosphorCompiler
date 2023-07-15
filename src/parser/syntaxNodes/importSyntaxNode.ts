import { Namespace } from '../namespace';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';

export class ImportSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly namespace: Namespace;

    public get children (): Iterable<SyntaxNode>
    {
        return [];
    }

    constructor (keyword: Token, namespace: Namespace)
    {
        super(SyntaxKind.Import);

        this.keyword = keyword;
        this.namespace = namespace;
    }
}
