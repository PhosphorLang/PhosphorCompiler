import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class BracketedExpressionSyntaxNode
{
    public readonly kind: SyntaxKind.BracketedExpression;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly openingToken: Token;
    public readonly expression: SyntaxNodes.Expression;
    public readonly closingToken: Token;

    constructor (openingToken: Token, expression: SyntaxNodes.Expression, closingToken: Token)
    {
        this.kind = SyntaxKind.BracketedExpression;

        this.openingToken = openingToken;
        this.expression = expression;
        this.closingToken = closingToken;

        this.token = this.openingToken;
        this.children = [this.expression];
    }
}
