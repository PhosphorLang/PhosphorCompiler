import * as SemanticNodes from '.';
import { SemanticKind } from '../semanticKind';

export class ElseClauseSemanticNode
{
    public readonly kind: SemanticKind.ElseClause;

    public followUp: SemanticNodes.Section|SemanticNodes.IfStatement;

    constructor (followUp: SemanticNodes.Section|SemanticNodes.IfStatement)
    {
        this.kind = SemanticKind.ElseClause;

        this.followUp = followUp;
    }
}
