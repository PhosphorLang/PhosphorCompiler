import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class AccessExpressionSyntaxNode
{
    public readonly kind: SyntaxKind.AccessExpression;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly primaryExpression: SyntaxNodes.AccessExpression|SyntaxNodes.PrimaryExpression;
    public readonly dot: Token;
    public readonly member: SyntaxNodes.CallExpression|SyntaxNodes.IdentifierExpression;

    constructor (
        primaryExpression: SyntaxNodes.PrimaryExpression,
        dot: Token,
        member: SyntaxNodes.CallExpression|SyntaxNodes.IdentifierExpression
    ) {
        this.kind = SyntaxKind.AccessExpression;

        this.primaryExpression = primaryExpression;
        this.dot = dot;
        this.member = member;

        this.token = this.dot;
        this.children = [this.member];
    }
}
