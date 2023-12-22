import { Namespace } from '../namespace';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';

export class ModuleSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly namespace: Namespace;

    public readonly isClass: boolean;
    public isEntryPoint: boolean;

    public get children (): Iterable<SyntaxNode>
    {
        return [];
    }

    constructor (keyword: Token, namespace: Namespace, isClass: boolean)
    {
        super(SyntaxKind.Module);

        this.keyword = keyword;
        this.namespace = namespace;

        this.isClass = isClass;
        this.isEntryPoint = false;
    }
}
