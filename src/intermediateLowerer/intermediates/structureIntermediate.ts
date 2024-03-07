import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Define a structure by the given structure symbol.
 */
export class StructureIntermediate
{
    public readonly kind: IntermediateKind.Structure;

    public readonly symbol: IntermediateSymbols.Structure;

    constructor (symbol: IntermediateSymbols.Structure)
    {
        this.kind = IntermediateKind.Structure;

        this.symbol = symbol;
    }
}
