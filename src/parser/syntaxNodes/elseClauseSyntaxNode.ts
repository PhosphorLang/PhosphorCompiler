import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class ElseClauseSyntaxNode
{
    public readonly kind: SyntaxKind.ElseClause;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly keyword: Token;
    public readonly followUp: SyntaxNodes.Section|SyntaxNodes.IfStatement;

    constructor (keyword: Token, followUp: SyntaxNodes.Section|SyntaxNodes.IfStatement)
    {
        this.kind = SyntaxKind.ElseClause;

        this.keyword = keyword;
        this.followUp = followUp;

        this.token = this.keyword;
        this.children = [this.followUp];
    }
}
