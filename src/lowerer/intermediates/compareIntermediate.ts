import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Compares the left operand with the right operand. \
 * The result of the comparison can afterwards be used for the conditional jump intermediates.
 */
export class CompareIntermediate
{
    public readonly kind: IntermediateKind.Compare;

    public leftOperand: IntermediateSymbols.Variable;
    public rightOperand: IntermediateSymbols.Variable;

    constructor (leftOperand: IntermediateSymbols.Variable, rightOperand: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Compare;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
