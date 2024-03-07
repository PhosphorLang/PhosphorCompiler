import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * And two operands. \
 * Write the bitwise/logical AND of the left and right operands to the left operand.
 */
export class AndIntermediate
{
    public readonly kind: IntermediateKind.And;

    public leftOperand: IntermediateSymbols.WritableValue;
    public rightOperand: IntermediateSymbols.Variable;

    constructor (leftOperand: IntermediateSymbols.WritableValue, rightOperand: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.And;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
