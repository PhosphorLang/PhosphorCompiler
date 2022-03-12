import IfStatementSyntaxNode from './ifStatementSyntaxNode';
import SectionSyntaxNode from './sectionSyntaxNode';
import SyntaxKind from '../syntaxKind';
import SyntaxNode from './syntaxNode';
import Token from '../../lexer/token';

export default class ElseClauseSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly followUp: SectionSyntaxNode|IfStatementSyntaxNode;

    public get children (): Iterable<SyntaxNode>
    {
        return [this.followUp];
    }

    constructor (keyword: Token, followUp: SectionSyntaxNode|IfStatementSyntaxNode)
    {
        super(SyntaxKind.ElseClause);

        this.keyword = keyword;
        this.followUp = followUp;
    }
}
