import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Conditional jump instruction to the given label symbol. Will only jump if the last compare instruction resulted in "not equal".
 */
export class JumpIfNotEqualIntermediate
{
    public readonly kind: IntermediateKind.JumpIfNotEqual;

    public target: IntermediateSymbols.Label;

    constructor (target: IntermediateSymbols.Label)
    {
        this.kind = IntermediateKind.JumpIfNotEqual;

        this.target = target;
    }
}
