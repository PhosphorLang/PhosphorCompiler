import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';

export class SectionSyntaxNode extends SyntaxNode
{
    public readonly opening: Token;
    public readonly statements: SyntaxNode[];
    public readonly closing: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return this.statements;
    }

    constructor (opening: Token, statements: SyntaxNode[], closing: Token)
    {
        super(SyntaxKind.Section);

        this.opening = opening;
        this.statements = statements;
        this.closing = closing;
    }
}
