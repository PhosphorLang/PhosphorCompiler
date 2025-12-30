import * as SpecialisedSymbols from '../../specialiser/specialisedSymbols';
import { BinarySemanticOperator } from '../semanticOperators/binarySemanticOperator';
import { SemanticKind } from '../semanticKind';

export class BinaryExpressionGenericNode <Expression>
{
    public readonly kind: SemanticKind.BinaryExpression;

    public readonly type: SpecialisedSymbols.ConcreteType;

    public readonly operator: BinarySemanticOperator;
    public readonly leftOperand: Expression;
    public readonly rightOperand: Expression;

    constructor (operator: BinarySemanticOperator, leftOperand: Expression, rightOperand: Expression)
    {
        this.kind = SemanticKind.BinaryExpression;

        this.type = operator.resultType;

        this.operator = operator;
        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
