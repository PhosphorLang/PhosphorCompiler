import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class VariableExpressionGenericNode
{
    public readonly kind: SemanticKind.VariableExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly variable: SemanticSymbols.VariableLike;

    constructor (variable: SemanticSymbols.VariableLike)
    {
        this.kind = SemanticKind.VariableExpression;

        this.type = variable.type;

        this.variable = variable;
    }
}
