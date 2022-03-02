import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Return the given value from the current function. \
 * Logically this is a move instruction. However, the transpiler implementation can optimise this away, for example by creating
 * the value directly in the register that will be used as return.
 */
export class ReturnIntermediate
{
    public readonly kind: IntermediateKind.Return;

    public value: IntermediateSymbols.ReadableValue|null;

    constructor (value: IntermediateSymbols.ReadableValue|null)
    {
        this.kind = IntermediateKind.Return;

        this.value = value;
    }
}
