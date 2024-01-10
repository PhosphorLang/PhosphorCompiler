import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Perform a not (bitflip) on the given operand (one's complement negation).
 */
export class NotIntermediate
{
    public readonly kind: IntermediateKind.Not;

    public operand: IntermediateSymbols.Variable;

    constructor (operand: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Not;

        this.operand = operand;
    }
}
