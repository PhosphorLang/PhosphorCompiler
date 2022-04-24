import { IntermediateSize } from '../intermediateSize';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class VariableIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.Variable;

    public readonly size: IntermediateSize;

    // TODO: Should variables get an index like parameter and return value?

    constructor (name: string, size: IntermediateSize)
    {
        super(name);

        this.kind = IntermediateSymbolKind.Variable;

        this.size = size;
    }
}
