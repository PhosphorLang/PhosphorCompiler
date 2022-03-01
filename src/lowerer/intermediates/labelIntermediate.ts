import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Define a label by the given label symbol.
 */
export class LabelIntermediate
{
    public readonly kind: IntermediateKind.Label;

    public readonly symbol: IntermediateSymbols.Label;

    constructor (symbol: IntermediateSymbols.Label)
    {
        this.kind = IntermediateKind.Label;

        this.symbol = symbol;
    }
}
