import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SectionSemanticNode } from './sectionSemanticNode';
import { SemanticKind } from '../semanticKind';
import { SemanticNode } from './semanticNode';

export class WhileStatementSemanticNode extends SemanticNode
{
    public condition: ExpressionSemanticNode;
    public section: SectionSemanticNode;

    constructor (condition: ExpressionSemanticNode, section: SectionSemanticNode)
    {
        super(SemanticKind.WhileStatement);

        this.condition = condition;
        this.section = section;
    }
}
