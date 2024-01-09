import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class FunctionParameterSyntaxNode
{
    public readonly kind: SyntaxKind.FunctionParameter;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly identifier: Token;
    public readonly type: SyntaxNodes.TypeClause;

    constructor (identifier: Token, type: SyntaxNodes.TypeClause)
    {
        this.kind = SyntaxKind.FunctionParameter;

        this.identifier = identifier;
        this.type = type;

        this.token = this.identifier;
        this.children = [];
    }
}
