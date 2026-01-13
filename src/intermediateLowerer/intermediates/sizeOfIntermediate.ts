import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';
import { IntermediateSize } from '../intermediateSize';

/**
 * The size of the given structure, to be determined by the transpiler.
 */
export class SizeOfIntermediate
{
    public readonly kind: IntermediateKind.SizeOf;

    public readonly to: IntermediateSymbols.WritableValue;
    public readonly of: IntermediateSymbols.Structure|IntermediateSize;

    constructor (to: IntermediateSymbols.WritableValue, of: IntermediateSymbols.Structure|IntermediateSize)
    {
        this.kind = IntermediateKind.SizeOf;

        this.to = to;
        this.of = of;
    }
}
