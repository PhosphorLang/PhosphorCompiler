import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * The size of the given structure, to be determined by the transpiler.
 */
export class SizeOfIntermediate
{
    public readonly kind: IntermediateKind.SizeOf;

    public readonly to: IntermediateSymbols.WritableValue;
    public readonly structure: IntermediateSymbols.Structure;

    constructor (to: IntermediateSymbols.WritableValue, structure: IntermediateSymbols.Structure)
    {
        this.kind = IntermediateKind.SizeOf;

        this.to = to;
        this.structure = structure;
    }
}
