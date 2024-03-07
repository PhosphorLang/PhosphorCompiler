import { IntermediateSize } from '../intermediateSize';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class FieldIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.Field;

    public readonly size: IntermediateSize;
    public readonly index: number;

    constructor (name: string, size: IntermediateSize, index: number)
    {
        super(name);

        this.kind = IntermediateSymbolKind.Field;

        this.size = size;
        this.index = index;
    }
}
