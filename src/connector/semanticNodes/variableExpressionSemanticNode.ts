import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class VariableExpressionSemanticNode
{
    public readonly kind: SemanticKind.VariableExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly variable: SemanticSymbols.Variable;

    constructor (variable: SemanticSymbols.Variable)
    {
        this.kind = SemanticKind.VariableExpression;

        this.type = variable.type;

        this.variable = variable;
    }
}
