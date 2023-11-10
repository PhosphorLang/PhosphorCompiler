import { ConcreteTypeSemanticSymbol } from '../semanticSymbols/concreteTypeSemanticSymbol';
import { SemanticOperator } from './semanticOperator';
import { SemanticOperatorKind } from '../semanticOperatorKind';

export class BinarySemanticOperator extends SemanticOperator
{
    public readonly leftType: ConcreteTypeSemanticSymbol;
    public readonly rightType: ConcreteTypeSemanticSymbol;

    constructor (
        operatorKind: SemanticOperatorKind,
        leftType: ConcreteTypeSemanticSymbol,
        rightType: ConcreteTypeSemanticSymbol,
        resultType: ConcreteTypeSemanticSymbol)
    {
        super(operatorKind, resultType);

        this.leftType = leftType;
        this.rightType = rightType;
    }
}
