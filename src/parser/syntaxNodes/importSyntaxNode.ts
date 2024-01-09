import * as SyntaxNodes from '.';
import { Namespace } from '../namespace';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class ImportSyntaxNode
{
    public readonly kind: SyntaxKind.Import;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly keyword: Token;
    public readonly namespace: Namespace;

    constructor (keyword: Token, namespace: Namespace)
    {
        this.kind = SyntaxKind.Import;

        this.keyword = keyword;
        this.namespace = namespace;

        this.token = this.keyword;
        this.children = [];
    }
}
