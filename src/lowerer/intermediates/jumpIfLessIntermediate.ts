import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

export class JumpIfLessIntermediate
{
    public readonly kind: IntermediateKind.JumpIfLess;

    public target: IntermediateSymbols.Label;

    constructor (target: IntermediateSymbols.Label)
    {
        this.kind = IntermediateKind.JumpIfLess;

        this.target = target;
    }
}
