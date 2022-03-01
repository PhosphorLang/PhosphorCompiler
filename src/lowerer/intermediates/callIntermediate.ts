import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

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
