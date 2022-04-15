import { IntermediateSize } from '../intermediateSize';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class ReturnValueIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.ReturnValue;

    public readonly size: IntermediateSize;

    public readonly index: number;

    constructor (index: number, size: IntermediateSize)
    {
        const name = `r#${index}`;

        super(name);

        this.kind = IntermediateSymbolKind.ReturnValue;

        this.index = index;
        this.size = size;
    }
}
