import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

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
