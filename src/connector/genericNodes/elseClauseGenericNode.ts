import { SemanticKind } from '../semanticKind';

export class ElseClauseGenericNode <Section, IfStatement>
{
    public readonly kind: SemanticKind.ElseClause;

    public readonly followUp: Section|IfStatement;

    constructor (followUp: Section|IfStatement)
    {
        this.kind = SemanticKind.ElseClause;

        this.followUp = followUp;
    }
}
