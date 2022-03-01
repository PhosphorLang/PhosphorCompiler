import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from "../intermediateKind";

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
