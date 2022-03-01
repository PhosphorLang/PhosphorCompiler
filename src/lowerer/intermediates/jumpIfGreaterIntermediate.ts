import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Conditional jump instruction to the given label symbol. Will only jump if the last compare instruction resulted in "greater".
 */
export class JumpIfGreaterIntermediate
{
    public readonly kind: IntermediateKind.JumpIfGreater;

    public target: IntermediateSymbols.Label;

    constructor (target: IntermediateSymbols.Label)
    {
        this.kind = IntermediateKind.JumpIfGreater;

        this.target = target;
    }
}
