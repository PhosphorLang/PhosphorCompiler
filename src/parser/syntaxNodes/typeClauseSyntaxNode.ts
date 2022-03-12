import SyntaxKind from '../syntaxKind';
import SyntaxNode from './syntaxNode';
import Token from '../../lexer/token';

export default class TypeClauseSyntaxNode extends SyntaxNode
{
    public readonly colon: Token;
    public readonly identifier: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return [];
    }

    constructor (colon: Token, identifier: Token)
    {
        super(SyntaxKind.TypeClause);

        this.colon = colon;
        this.identifier = identifier;
    }
}
