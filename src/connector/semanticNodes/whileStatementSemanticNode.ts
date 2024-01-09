import * as SemanticNodes from '.';
import { SemanticKind } from '../semanticKind';

export class WhileStatementSemanticNode
{
    public readonly kind: SemanticKind.WhileStatement;

    public condition: SemanticNodes.Expression;
    public section: SemanticNodes.Section;

    constructor (condition: SemanticNodes.Expression, section: SemanticNodes.Section)
    {
        this.kind = SemanticKind.WhileStatement;

        this.condition = condition;
        this.section = section;
    }
}
