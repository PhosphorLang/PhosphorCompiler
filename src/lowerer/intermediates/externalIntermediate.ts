import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from "../intermediateKind";

/**
 * Declares the function (of the given function symbol) as external, which means that it is defined in an separate linked library.
 */
export class ExternalIntermediate
{
    public readonly kind: IntermediateKind.External;

    public readonly symbol: IntermediateSymbols.Function;

    constructor (symbol: IntermediateSymbols.Function)
    {
        this.kind = IntermediateKind.External;

        this.symbol = symbol;
    }
}
