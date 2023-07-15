import { IntermediateSize } from '../intermediateSize';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class ConstantIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.Constant;

    public readonly size: IntermediateSize.Pointer;
    public readonly value: string;

    // TODO: Should the constant get an index like variables, parameters and return values?

    constructor (name: string, value: string)
    {
        super(name);

        this.kind = IntermediateSymbolKind.Constant;
        this.size = IntermediateSize.Pointer;

        this.value = value;
    }
}
