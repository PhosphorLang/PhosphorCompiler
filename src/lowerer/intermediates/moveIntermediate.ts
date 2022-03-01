import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

export class MoveIntermediate
{
    public readonly kind: IntermediateKind.Move;

    public to: IntermediateSymbols.Variable;
    public from: IntermediateSymbols.ReadableValue;

    constructor (to: IntermediateSymbols.Variable, from: IntermediateSymbols.ReadableValue)
    {
        this.kind = IntermediateKind.Move;

        this.to = to;
        this.from = from;
    }
}
