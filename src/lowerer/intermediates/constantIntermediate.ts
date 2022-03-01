import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

export class ConstantIntermediate
{
    public readonly kind: IntermediateKind.Constant;

    public readonly symbol: IntermediateSymbols.Constant;

    constructor (symbol: IntermediateSymbols.Constant)
    {
        this.kind = IntermediateKind.Constant;

        this.symbol = symbol;
    }
}
