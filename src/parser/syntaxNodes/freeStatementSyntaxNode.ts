import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class FreeStatementSyntaxNode
{
    public readonly kind: SyntaxKind.FreeStatement;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly keyword: Token;
    public readonly expression: SyntaxNodes.Expression;

    constructor (keyword: Token, expression: SyntaxNodes.Expression)
    {
        this.kind = SyntaxKind.FreeStatement;

        this.keyword = keyword;
        this.expression = expression;

        this.token = this.keyword;
        this.children = [];
    }
}
