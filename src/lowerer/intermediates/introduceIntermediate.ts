import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Introduce a variable, which means that a location must be available or freed for it.
 */
export class IntroduceIntermediate
{
    public readonly kind: IntermediateKind.Introduce;

    public variableSymbol: IntermediateSymbols.Variable;

    constructor (variableSymbol: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Introduce;

        this.variableSymbol = variableSymbol;
    }
}
