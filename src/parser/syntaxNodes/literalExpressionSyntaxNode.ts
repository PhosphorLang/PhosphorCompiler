import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class LiteralExpressionSyntaxNode
{
    public readonly kind: SyntaxKind.LiteralExpression;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly literal: Token;

    constructor (literal: Token)
    {
        this.kind = SyntaxKind.LiteralExpression;

        this.literal = literal;

        this.token = this.literal;
        this.children = [];
    }
}
