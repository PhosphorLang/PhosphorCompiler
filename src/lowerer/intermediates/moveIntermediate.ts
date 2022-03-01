import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Set the value in "to" to the value of "from". \
 * The previous value in "to" is lost, the previous value in "from" is kept.
 */
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
