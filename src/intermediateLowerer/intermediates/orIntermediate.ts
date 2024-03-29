import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Or two operands. \
 * Write the bitwise/logical OR of the left and right operands to the left operand.
 */
export class OrIntermediate
{
    public readonly kind: IntermediateKind.Or;

    public leftOperand: IntermediateSymbols.WritableValue;
    public rightOperand: IntermediateSymbols.Variable;

    constructor (leftOperand: IntermediateSymbols.WritableValue, rightOperand: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Or;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
