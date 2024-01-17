import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Divide two operands. \
 * The right operand is divided by the left operand. The result is written to the left operand.
 */
export class DivideIntermediate
{
    public readonly kind: IntermediateKind.Divide;

    public leftOperand: IntermediateSymbols.WritableValue;
    public rightOperand: IntermediateSymbols.Variable;

    constructor (leftOperand: IntermediateSymbols.WritableValue, rightOperand: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Divide;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
