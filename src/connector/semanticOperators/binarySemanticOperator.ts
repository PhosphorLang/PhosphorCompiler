import SemanticOperator from './semanticOperator';
import SemanticOperatorKind from '../semanticOperatorKind';
import TypeSemanticSymbol from '../semanticSymbols/typeSemanticSymbol';

export default class BinarySemanticOperator extends SemanticOperator
{
    public readonly leftType: TypeSemanticSymbol;
    public readonly rightType: TypeSemanticSymbol;

    constructor (
        operatorKind: SemanticOperatorKind,
        leftType: TypeSemanticSymbol,
        rightType: TypeSemanticSymbol,
        resultType: TypeSemanticSymbol)
    {
        super(operatorKind, resultType);

        this.leftType = leftType;
        this.rightType = rightType;
    }
}
