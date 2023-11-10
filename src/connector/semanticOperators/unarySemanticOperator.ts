import { ConcreteTypeSemanticSymbol } from '../semanticSymbols/concreteTypeSemanticSymbol';
import { SemanticOperator } from './semanticOperator';
import { SemanticOperatorKind } from '../semanticOperatorKind';

export class UnarySemanticOperator extends SemanticOperator
{
    public readonly operandType: ConcreteTypeSemanticSymbol;

    constructor (operatorKind: SemanticOperatorKind, operandType: ConcreteTypeSemanticSymbol, resultType: ConcreteTypeSemanticSymbol)
    {
        super(operatorKind, resultType);

        this.operandType = operandType;
    }
}
