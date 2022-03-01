import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

export class JumpIfEqualIntermediate
{
    public readonly kind: IntermediateKind.JumpIfEqual;

    public target: IntermediateSymbols.Label;

    constructor (target: IntermediateSymbols.Label)
    {
        this.kind = IntermediateKind.JumpIfEqual;

        this.target = target;
    }
}
