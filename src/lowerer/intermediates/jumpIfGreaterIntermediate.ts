import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

export class JumpIfGreaterIntermediate
{
    public readonly kind: IntermediateKind.JumpIfGreater;

    public target: IntermediateSymbols.Label;

    constructor (target: IntermediateSymbols.Label)
    {
        this.kind = IntermediateKind.JumpIfGreater;

        this.target = target;
    }
}
