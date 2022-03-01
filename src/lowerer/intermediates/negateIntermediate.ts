import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * The value of the given operand is negated (two's complement negation).
 */
export class NegateIntermediate
{
    public readonly kind: IntermediateKind.Negate;

    public operand: IntermediateSymbols.Variable;

    constructor (operand: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Negate;

        this.operand = operand;
    }
}
