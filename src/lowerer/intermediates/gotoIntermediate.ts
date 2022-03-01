import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

export class GotoIntermediate
{
    public readonly kind: IntermediateKind.Goto;

    public labelSymbol: IntermediateSymbols.Label;

    constructor (labelSymbol: IntermediateSymbols.Label)
    {
        this.kind = IntermediateKind.Goto;

        this.labelSymbol = labelSymbol;
    }
}
