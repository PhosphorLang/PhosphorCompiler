import * as SemanticNodes from '.';
import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';
import { UnarySemanticOperator } from '../semanticOperators/unarySemanticOperator';

export class UnaryExpressionSemanticNode
{
    public readonly kind: SemanticKind.UnaryExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly operator: UnarySemanticOperator;
    public operand: SemanticNodes.Expression;

    constructor (operator: UnarySemanticOperator, operand: SemanticNodes.Expression)
    {
        this.kind = SemanticKind.UnaryExpression;

        this.type = operator.resultType;

        this.operator = operator;
        this.operand = operand;
    }
}
