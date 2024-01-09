import * as SyntaxNodes from '.';
import { Namespace } from '../namespace';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class ModuleSyntaxNode
{
    public readonly kind: SyntaxKind.Module;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly keyword: Token;
    public readonly namespace: Namespace;

    public readonly isClass: boolean;
    public isEntryPoint: boolean;

    constructor (keyword: Token, namespace: Namespace, isClass: boolean)
    {
        this.kind = SyntaxKind.Module;

        this.keyword = keyword;
        this.namespace = namespace;

        this.isClass = isClass;
        this.isEntryPoint = false;

        this.token = this.keyword;
        this.children = [];
    }
}
