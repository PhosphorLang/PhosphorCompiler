import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Conditional jump instruction to the given label symbol. Will only jump if the last compare instruction resulted in "less".
 */
export class JumpIfLessIntermediate
{
    public readonly kind: IntermediateKind.JumpIfLess;

    public target: IntermediateSymbols.Label;

    constructor (target: IntermediateSymbols.Label)
    {
        this.kind = IntermediateKind.JumpIfLess;

        this.target = target;
    }
}
