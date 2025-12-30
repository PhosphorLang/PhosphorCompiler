import * as SpecialisedSymbols from '../../specialiser/specialisedSymbols';
import { SemanticOperator } from './semanticOperator';
import { SemanticOperatorKind } from '../semanticOperatorKind';

export class BinarySemanticOperator extends SemanticOperator
{
    public readonly leftType: SpecialisedSymbols.ConcreteType;
    public readonly rightType: SpecialisedSymbols.ConcreteType;

    constructor (
        operatorKind: SemanticOperatorKind,
        leftType: SpecialisedSymbols.ConcreteType,
        rightType: SpecialisedSymbols.ConcreteType,
        resultType: SpecialisedSymbols.ConcreteType)
    {
        super(operatorKind, resultType);

        this.leftType = leftType;
        this.rightType = rightType;
    }
}
