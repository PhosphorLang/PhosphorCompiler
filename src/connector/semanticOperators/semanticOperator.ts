import * as SpecialisedSymbols from '../../specialiser/specialisedSymbols';
import { SemanticOperatorKind } from '../semanticOperatorKind';

export abstract class SemanticOperator
{
    public readonly kind: SemanticOperatorKind;
    public readonly resultType: SpecialisedSymbols.ConcreteType;

    constructor (kind: SemanticOperatorKind, resultType: SpecialisedSymbols.ConcreteType)
    {
        this.kind = kind;
        this.resultType = resultType;
    }
}
