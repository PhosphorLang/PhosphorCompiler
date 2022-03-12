import SemanticOperator from './semanticOperator';
import SemanticOperatorKind from '../semanticOperatorKind';
import TypeSemanticSymbol from '../semanticSymbols/typeSemanticSymbol';

export default class UnarySemanticOperator extends SemanticOperator
{
    public readonly operandType: TypeSemanticSymbol;

    constructor (operatorKind: SemanticOperatorKind, operandType: TypeSemanticSymbol, resultType: TypeSemanticSymbol)
    {
        super(operatorKind, resultType);

        this.operandType = operandType;
    }
}
