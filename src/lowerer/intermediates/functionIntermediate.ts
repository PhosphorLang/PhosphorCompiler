import * as Intermediates from '.';
import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Define a function by the given function symbol. It contains the intermediates given in body.
 */
export class FunctionIntermediate
{
    public readonly kind: IntermediateKind.Function;

    public readonly symbol: IntermediateSymbols.Function;

    public body: Intermediates.Statement[];

    constructor (symbol: IntermediateSymbols.Function, body: Intermediates.Statement[])
    {
        this.kind = IntermediateKind.Function;

        this.symbol = symbol;
        this.body = body;
    }
}
