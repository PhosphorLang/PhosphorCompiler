import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class GenericParameterSyntaxNode
{
    public readonly kind: SyntaxKind.GenericParameter;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly identifier: Token;

    constructor (identifier: Token)
    {
        this.kind = SyntaxKind.GenericParameter;

        this.identifier = identifier;

        this.token = this.identifier;
        this.children = [];
    }
}
