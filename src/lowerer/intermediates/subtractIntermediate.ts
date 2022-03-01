import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

export class SubtractIntermediate
{
    public readonly kind: IntermediateKind.Subtract;

    public leftOperand: IntermediateSymbols.Variable;
    public rightOperand: IntermediateSymbols.ReadableValue;

    constructor (leftOperand: IntermediateSymbols.Variable, rightOperand: IntermediateSymbols.ReadableValue)
    {
        this.kind = IntermediateKind.Subtract;

        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
