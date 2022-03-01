import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

export class GotoIntermediate
{
    public readonly kind: IntermediateKind.Goto;

    public target: IntermediateSymbols.Label;

    constructor (target: IntermediateSymbols.Label)
    {
        this.kind = IntermediateKind.Goto;

        this.target = target;
    }
}
