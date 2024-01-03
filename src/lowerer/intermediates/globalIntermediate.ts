import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Definition of a global, which is a variable in the module scope.
 */
export class GlobalIntermediate
{
    public readonly kind: IntermediateKind.Global;

    public symbol: IntermediateSymbols.Global;

    constructor (symbol: IntermediateSymbols.Global)
    {
        this.kind = IntermediateKind.Global;

        this.symbol = symbol;
    }
}
