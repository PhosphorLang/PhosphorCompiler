import { ConcreteTypeSemanticSymbol } from '../semanticSymbols/concreteTypeSemanticSymbol';
import { SemanticOperatorKind } from '../semanticOperatorKind';

export abstract class SemanticOperator
{
    public readonly kind: SemanticOperatorKind;
    public readonly resultType: ConcreteTypeSemanticSymbol;

    constructor (kind: SemanticOperatorKind, resultType: ConcreteTypeSemanticSymbol)
    {
        this.kind = kind;
        this.resultType = resultType;
    }
}
