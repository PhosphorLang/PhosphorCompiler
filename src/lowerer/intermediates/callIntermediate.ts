import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Call the function defined by the function symbol.
 */
export class CallIntermediate
{
    public readonly kind: IntermediateKind.Call;

    public functionSymbol: IntermediateSymbols.Function;

    constructor (functionSymbol: IntermediateSymbols.Function)
    {
        this.kind = IntermediateKind.Call;

        this.functionSymbol = functionSymbol;
    }
}
