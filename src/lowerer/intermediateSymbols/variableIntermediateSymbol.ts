import { IntermediateSize } from '../intermediateSize';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class VariableIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.Variable;

    public readonly size: IntermediateSize;

    public readonly index: number;

    constructor (index: number, size: IntermediateSize)
    {
        const name = `v#${index}`;

        super(name);

        this.kind = IntermediateSymbolKind.Variable;

        this.index = index;
        this.size = size;
    }
}
