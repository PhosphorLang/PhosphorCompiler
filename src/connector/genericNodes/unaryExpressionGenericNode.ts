import * as SpecialisedSymbols from '../../specialiser/specialisedSymbols';
import { SemanticKind } from '../semanticKind';
import { UnarySemanticOperator } from '../semanticOperators/unarySemanticOperator';

export class UnaryExpressionGenericNode <Expression>
{
    public readonly kind: SemanticKind.UnaryExpression;

    public readonly type: SpecialisedSymbols.ConcreteType;

    public readonly operator: UnarySemanticOperator;
    public readonly operand: Expression;

    constructor (operator: UnarySemanticOperator, operand: Expression)
    {
        this.kind = SemanticKind.UnaryExpression;

        this.type = operator.resultType;

        this.operator = operator;
        this.operand = operand;
    }
}
