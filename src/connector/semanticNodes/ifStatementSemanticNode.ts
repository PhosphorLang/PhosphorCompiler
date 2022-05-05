import { ElseClauseSemanticNode } from './elseClauseSemanticNode';
import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SectionSemanticNode } from './sectionSemanticNode';
import { SemanticKind } from '../semanticKind';
import { SemanticNode } from './semanticNode';

export class IfStatementSemanticNode extends SemanticNode
{
    public condition: ExpressionSemanticNode;
    public section: SectionSemanticNode;
    public elseClause: ElseClauseSemanticNode|null;

    constructor (condition: ExpressionSemanticNode, section: SectionSemanticNode, elseClause: ElseClauseSemanticNode|null)
    {
        super(SemanticKind.IfStatement);

        this.condition = condition;
        this.section = section;
        this.elseClause = elseClause;
    }
}
