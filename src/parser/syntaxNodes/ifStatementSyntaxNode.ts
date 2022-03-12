import ElseClauseSyntaxNode from './elseClauseSyntaxNode';
import ExpressionSyntaxNode from './expressionSyntaxNode';
import SectionSyntaxNode from './sectionSyntaxNode';
import SyntaxKind from '../syntaxKind';
import SyntaxNode from './syntaxNode';
import Token from '../../lexer/token';

export default class IfStatementSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly condition: ExpressionSyntaxNode;
    public readonly section: SectionSyntaxNode;
    public readonly elseClause: ElseClauseSyntaxNode|null;

    public get children (): Iterable<SyntaxNode>
    {
        return [this.section];
    }

    constructor (keyword: Token, condition: ExpressionSyntaxNode, section: SectionSyntaxNode, elseClause: ElseClauseSyntaxNode|null)
    {
        super(SyntaxKind.IfStatement);

        this.keyword = keyword;
        this.condition = condition;
        this.section = section;
        this.elseClause = elseClause;
    }
}
