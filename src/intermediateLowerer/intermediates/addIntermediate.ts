import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Add two operands. \
 * The right operand is added to the left operand.
 */
export class AddIntermediate
{
    public readonly kind: IntermediateKind.Add;

    public leftOperand: IntermediateSymbols.WritableValue;
    public rightOperand: IntermediateSymbols.Variable;

    constructor (leftOperand: IntermediateSymbols.WritableValue, rightOperand: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Add;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
