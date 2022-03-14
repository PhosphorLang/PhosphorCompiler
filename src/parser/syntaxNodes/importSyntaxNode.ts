import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';

export class ImportSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly path: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return [];
    }

    constructor (keyword: Token, path: Token)
    {
        super(SyntaxKind.Import);

        this.keyword = keyword;
        this.path = path;
    }
}
