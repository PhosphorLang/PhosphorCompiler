import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

export class CompareIntermediate
{
    public readonly kind: IntermediateKind.Compare;

    public leftOperand: IntermediateSymbols.ReadableValue;
    public rightOperand: IntermediateSymbols.ReadableValue;

    constructor (leftOperand: IntermediateSymbols.ReadableValue, rightOperand: IntermediateSymbols.ReadableValue)
    {
        this.kind = IntermediateKind.Compare;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
