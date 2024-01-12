import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class AssignmentGenericNode <Expression>
{
    public readonly kind: SemanticKind.Assignment;

    public readonly variable: SemanticSymbols.VariableLike;
    public readonly expression: Expression;

    constructor (variable: SemanticSymbols.VariableLike, expression: Expression)
    {
        this.kind = SemanticKind.Assignment;

        this.variable = variable;
        this.expression = expression;
    }
}
