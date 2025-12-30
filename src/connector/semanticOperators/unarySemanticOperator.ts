import * as SpecialisedSymbols from '../../specialiser/specialisedSymbols';
import { SemanticOperator } from './semanticOperator';
import { SemanticOperatorKind } from '../semanticOperatorKind';

export class UnarySemanticOperator extends SemanticOperator
{
    public readonly operandType: SpecialisedSymbols.ConcreteType;

    constructor (
        operatorKind: SemanticOperatorKind,
        operandType: SpecialisedSymbols.ConcreteType,
        resultType: SpecialisedSymbols.ConcreteType
    ) {
        super(operatorKind, resultType);

        this.operandType = operandType;
    }
}
