import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Multiply two operands. \
 * The right operand is multiplied with the left operand. The result is written to the left operand.
 */
export class MultiplyIntermediate
{
    public readonly kind: IntermediateKind.Multiply;

    public leftOperand: IntermediateSymbols.WritableValue;
    public rightOperand: IntermediateSymbols.Variable;

    constructor (leftOperand: IntermediateSymbols.WritableValue, rightOperand: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Multiply;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
