import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class TypeClauseSyntaxNode
{
    public readonly kind: SyntaxKind.TypeClause;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly colon: Token;
    public readonly type: SyntaxNodes.Type;

    constructor (colon: Token, type: SyntaxNodes.Type)
    {
        this.kind = SyntaxKind.TypeClause;

        this.colon = colon;
        this.type = type;

        this.token = this.colon;
        this.children = [this.type];
    }
}
