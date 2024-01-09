import * as SemanticNodes from '.';
import { SemanticKind } from '../semanticKind';

export class IfStatementSemanticNode
{
    public readonly kind: SemanticKind.IfStatement;

    public condition: SemanticNodes.Expression;
    public section: SemanticNodes.Section;
    public elseClause: SemanticNodes.ElseClause|null;

    constructor (condition: SemanticNodes.Expression, section: SemanticNodes.Section, elseClause: SemanticNodes.ElseClause|null)
    {
        this.kind = SemanticKind.IfStatement;

        this.condition = condition;
        this.section = section;
        this.elseClause = elseClause;
    }
}
