import { IntermediateSize } from '../intermediateSize';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class ConstantIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.Constant;

    public readonly size: IntermediateSize;

    constructor (name: string, size: IntermediateSize)
    {
        super(name);

        this.kind = IntermediateSymbolKind.Constant;

        this.size = size;
    }
}
