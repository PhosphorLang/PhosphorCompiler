import * as SyntaxNodes from '.';
import { ElementsList } from '../elementsList';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class CallExpressionSyntaxNode
{
    public readonly kind: SyntaxKind.CallExpression;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly identifier: Token;
    public readonly opening: Token;
    public readonly arguments: ElementsList<SyntaxNodes.Expression>;
    public readonly closing: Token;

    constructor (identifier: Token, opening: Token, callArguments: ElementsList<SyntaxNodes.Expression>, closing: Token)
    {
        this.kind = SyntaxKind.CallExpression;

        this.identifier = identifier;
        this.opening = opening;
        this.arguments = callArguments;
        this.closing = closing;

        this.token = this.identifier;
        this.children = this.arguments.elements;
    }
}
