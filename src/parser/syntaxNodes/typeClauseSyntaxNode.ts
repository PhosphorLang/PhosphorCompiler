import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';
import { TypeSyntaxNode } from './typeSyntaxNode';

export class TypeClauseSyntaxNode extends SyntaxNode
{
    public readonly colon: Token;
    public readonly type: TypeSyntaxNode;

    public get children (): Iterable<SyntaxNode>
    {
        return [this.type];
    }

    constructor (colon: Token, type: TypeSyntaxNode)
    {
        super(SyntaxKind.TypeClause);

        this.colon = colon;
        this.type = type;
    }
}
