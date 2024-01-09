import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class VariableExpressionSyntaxNode
{
    public readonly kind: SyntaxKind.VariableExpression;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly identifier: Token;

    constructor (identifier: Token)
    {
        this.kind = SyntaxKind.VariableExpression;

        this.identifier = identifier;

        this.token = this.identifier;
        this.children = [];
    }
}
