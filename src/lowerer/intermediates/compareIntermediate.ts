import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Compares the left operand with the right operand. \
 * The result of the comparison can afterwards be used for the conditional jump intermediates.
 */
export class CompareIntermediate
{
    public readonly kind: IntermediateKind.Compare;

    // TODO: The compare instruction should only be able to operate with variables like everything else besides the move instruction.
    public leftOperand: IntermediateSymbols.ReadableValue;
    public rightOperand: IntermediateSymbols.ReadableValue;

    constructor (leftOperand: IntermediateSymbols.ReadableValue, rightOperand: IntermediateSymbols.ReadableValue)
    {
        this.kind = IntermediateKind.Compare;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
