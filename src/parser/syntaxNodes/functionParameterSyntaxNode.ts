import SyntaxKind from '../syntaxKind';
import SyntaxNode from './syntaxNode';
import Token from '../../lexer/token';
import TypeClauseSyntaxNode from './typeClauseSyntaxNode';

export default class FunctionParameterSyntaxNode extends SyntaxNode
{
    public readonly identifier: Token;
    public readonly type: TypeClauseSyntaxNode;

    public get children (): Iterable<SyntaxNode>
    {
        return [];
    }

    constructor (identifier: Token, type: TypeClauseSyntaxNode)
    {
        super(SyntaxKind.FunctionParameter);

        this.identifier = identifier;
        this.type = type;
    }
}
