import { SemanticKind } from '../semanticKind';

export class WhileStatementGenericNode <Expression, Section>
{
    public readonly kind: SemanticKind.WhileStatement;

    public readonly condition: Expression;
    public readonly section: Section;

    constructor (condition: Expression, section: Section)
    {
        this.kind = SemanticKind.WhileStatement;

        this.condition = condition;
        this.section = section;
    }
}
