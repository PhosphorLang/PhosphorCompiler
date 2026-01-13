import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';
import { IntermediateSize } from '../intermediateSize';

/**
 * Load an element from an array at a given index.
 */
export class ArrayLoadIntermediate
{
    public readonly kind: IntermediateKind.ArrayLoad;

    public readonly to: IntermediateSymbols.WritableValue;
    public readonly array: IntermediateSymbols.ReadableValue;
    public readonly index: IntermediateSymbols.ReadableValue;
    public readonly size: IntermediateSize;

    constructor (
        to: IntermediateSymbols.WritableValue,
        array: IntermediateSymbols.ReadableValue,
        index: IntermediateSymbols.ReadableValue,
        size: IntermediateSize
    ) {
        this.kind = IntermediateKind.ArrayLoad;

        this.to = to;
        this.array = array;
        this.index = index;
        this.size = size;
    }
}
