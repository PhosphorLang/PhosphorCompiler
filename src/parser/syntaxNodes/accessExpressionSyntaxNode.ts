import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class AccessExpressionSyntaxNode
{
    public readonly kind: SyntaxKind.AccessExpression;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly identifier: Token;
    public readonly dot: Token;
    public readonly functionCall: SyntaxNodes.CallExpression;

    constructor (identifier: Token, dot: Token, functionCall: SyntaxNodes.CallExpression)
    {
        this.kind = SyntaxKind.AccessExpression;

        this.identifier = identifier;
        this.dot = dot;
        this.functionCall = functionCall;

        this.token = this.identifier;
        this.children = [this.functionCall];
    }
}
