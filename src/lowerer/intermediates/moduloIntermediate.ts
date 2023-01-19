import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Modulo two operands. \
 * The right operand is divided by the left operand. The reminder is written to the left operand.
 */
export class ModuloIntermediate
{
    public readonly kind: IntermediateKind.Modulo;

    public leftOperand: IntermediateSymbols.Variable;
    public rightOperand: IntermediateSymbols.Variable;

    constructor (leftOperand: IntermediateSymbols.Variable, rightOperand: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Modulo;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
