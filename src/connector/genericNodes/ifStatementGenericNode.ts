import { SemanticKind } from '../semanticKind';

export class IfStatementGenericNode <Expression, Section, ElseClause>
{
    public readonly kind: SemanticKind.IfStatement;

    public readonly condition: Expression;
    public readonly section: Section;
    public readonly elseClause: ElseClause|null;

    constructor (condition: Expression, section: Section, elseClause: ElseClause|null)
    {
        this.kind = SemanticKind.IfStatement;

        this.condition = condition;
        this.section = section;
        this.elseClause = elseClause;
    }
}
