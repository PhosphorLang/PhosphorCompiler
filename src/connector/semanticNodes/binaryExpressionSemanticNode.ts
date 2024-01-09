import * as SemanticNodes from '.';
import * as SemanticSymbols from '../semanticSymbols';
import { BinarySemanticOperator } from '../semanticOperators/binarySemanticOperator';
import { SemanticKind } from '../semanticKind';

export class BinaryExpressionSemanticNode
{
    public readonly kind: SemanticKind.BinaryExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly operator: BinarySemanticOperator;
    public leftOperand: SemanticNodes.Expression;
    public rightOperand: SemanticNodes.Expression;

    constructor (operator: BinarySemanticOperator, leftOperand: SemanticNodes.Expression, rightOperand: SemanticNodes.Expression)
    {
        this.kind = SemanticKind.BinaryExpression;

        this.type = operator.resultType;

        this.operator = operator;
        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
