import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class SectionSyntaxNode
{
    public readonly kind: SyntaxKind.Section;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly opening: Token;
    public readonly statements: SyntaxNodes.Statement[];
    public readonly closing: Token;

    constructor (opening: Token, statements: SyntaxNodes.Statement[], closing: Token)
    {
        this.kind = SyntaxKind.Section;

        this.opening = opening;
        this.statements = statements;
        this.closing = closing;

        this.token = this.opening;
        this.children = this.statements;
    }
}
