import { IntermediateSize } from '../intermediateSize';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class ParameterIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.Parameter;

    public readonly size: IntermediateSize;

    constructor (name: string, size: IntermediateSize)
    {
        super(name);

        this.kind = IntermediateSymbolKind.Parameter;

        this.size = size;
    }
}
