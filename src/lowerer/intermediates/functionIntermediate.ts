import * as IntermediateSymbols from '../intermediateSymbols';
import { Intermediate } from '.';
import { IntermediateKind } from '../intermediateKind';

export class FunctionIntermediate
{
    public readonly kind: IntermediateKind.Function;

    public readonly symbol: IntermediateSymbols.Function;

    public body: Intermediate[];

    constructor (symbol: IntermediateSymbols.Function, body: Intermediate[])
    {
        this.kind = IntermediateKind.Function;

        this.symbol = symbol;
        this.body = body;
    }
}
