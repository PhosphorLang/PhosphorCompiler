import { IntermediateSize } from '../intermediateSize';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class ReturnValueIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.ReturnValue;

    public readonly size: IntermediateSize;

    constructor (size: IntermediateSize)
    {
        super('r#0');

        this.kind = IntermediateSymbolKind.ReturnValue;

        this.size = size;
    }
}
