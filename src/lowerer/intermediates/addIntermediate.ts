import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Add two operands. \
 * The right operand is added to the left operand.
 */
export class AddIntermediate
{
    public readonly kind: IntermediateKind.Add;

    public leftOperand: IntermediateSymbols.Variable;
    public rightOperand: IntermediateSymbols.ReadableValue;

    constructor (leftOperand: IntermediateSymbols.Variable, rightOperand: IntermediateSymbols.ReadableValue)
    {
        this.kind = IntermediateKind.Add;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
