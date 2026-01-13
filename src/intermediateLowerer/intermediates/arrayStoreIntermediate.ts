import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';
import { IntermediateSize } from '../intermediateSize';

/**
 * Store a value into an array at a given index.
 */
export class ArrayStoreIntermediate
{
    public readonly kind: IntermediateKind.ArrayStore;

    public readonly array: IntermediateSymbols.ReadableValue;
    public readonly index: IntermediateSymbols.ReadableValue;
    public readonly source: IntermediateSymbols.ReadableValue;
    public readonly size: IntermediateSize;

    constructor (
        array: IntermediateSymbols.ReadableValue,
        index: IntermediateSymbols.ReadableValue,
        source: IntermediateSymbols.ReadableValue,
        size: IntermediateSize
    ) {
        this.kind = IntermediateKind.ArrayStore;

        this.array = array;
        this.index = index;
        this.source = source;
        this.size = size;
    }
}
