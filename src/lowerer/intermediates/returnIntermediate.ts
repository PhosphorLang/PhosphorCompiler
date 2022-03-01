import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Return the given value from the current function.
 */
export class ReturnIntermediate
{
    public readonly kind: IntermediateKind.Return;

    public value: IntermediateSymbols.ReadableValue;

    constructor (value: IntermediateSymbols.ReadableValue)
    {
        this.kind = IntermediateKind.Return;

        this.value = value;
    }
}
