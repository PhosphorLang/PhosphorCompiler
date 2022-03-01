import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

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
