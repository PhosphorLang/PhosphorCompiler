import { IntermediateSize } from '../intermediateSize';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class ParameterIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.Parameter;

    public readonly size: IntermediateSize;

    public readonly index: number;

    constructor (index: number, size: IntermediateSize)
    {
        const name = `p#${index}`;

        super(name);

        this.kind = IntermediateSymbolKind.Parameter;

        this.index = index;
        this.size = size;
    }
}
