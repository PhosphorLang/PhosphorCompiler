import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Conditional jump instruction to the given label symbol. Will only jump if the last compare instruction resulted in "equal".
 */
export class JumpIfEqualIntermediate
{
    public readonly kind: IntermediateKind.JumpIfEqual;

    public target: IntermediateSymbols.Label;

    constructor (target: IntermediateSymbols.Label)
    {
        this.kind = IntermediateKind.JumpIfEqual;

        this.target = target;
    }
}
