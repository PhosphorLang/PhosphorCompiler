import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Subtract two operands. \
 * The right operand is subtracted from the left operand.
 */
export class SubtractIntermediate
{
    public readonly kind: IntermediateKind.Subtract;

    public leftOperand: IntermediateSymbols.WritableValue;
    public rightOperand: IntermediateSymbols.Variable;

    constructor (leftOperand: IntermediateSymbols.WritableValue, rightOperand: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Subtract;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
