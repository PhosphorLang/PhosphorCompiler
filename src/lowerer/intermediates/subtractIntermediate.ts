import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Subtract two operands. \
 * The right operand is subtracted from the left operand.
 */
export class SubtractIntermediate
{
    public readonly kind: IntermediateKind.Subtract;

    public leftOperand: IntermediateSymbols.Variable;
    public rightOperand: IntermediateSymbols.Variable;

    constructor (leftOperand: IntermediateSymbols.Variable, rightOperand: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Subtract;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
