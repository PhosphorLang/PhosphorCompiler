import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Dismiss a variable, which means marking the location(s) the variable is stored at as free to use.
 */
export class DismissIntermediate
{
    public readonly kind: IntermediateKind.Dismiss;

    public variableSymbol: IntermediateSymbols.Variable;

    constructor (variableSymbol: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Dismiss;

        this.variableSymbol = variableSymbol;
    }
}
