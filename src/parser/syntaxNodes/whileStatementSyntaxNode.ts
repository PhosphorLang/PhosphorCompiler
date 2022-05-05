import { ExpressionSyntaxNode } from './expressionSyntaxNode';
import { SectionSyntaxNode } from './sectionSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';

export class WhileStatementSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly condition: ExpressionSyntaxNode;
    public readonly section: SectionSyntaxNode;

    public get children (): Iterable<SyntaxNode>
    {
        return [this.section];
    }

    constructor (keyword: Token, condition: ExpressionSyntaxNode, section: SectionSyntaxNode)
    {
        super(SyntaxKind.WhileStatement);

        this.keyword = keyword;
        this.condition = condition;
        this.section = section;
    }
}
