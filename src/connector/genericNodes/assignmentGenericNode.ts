import { SemanticKind } from '../semanticKind';

export class AssignmentGenericNode <Expression, FieldExpression, VariableExpression>
{
    public readonly kind: SemanticKind.Assignment;

    public readonly to: FieldExpression|VariableExpression;
    public readonly from: Expression;

    constructor (to: FieldExpression|VariableExpression, from: Expression)
    {
        this.kind = SemanticKind.Assignment;

        this.to = to;
        this.from = from;
    }
}
