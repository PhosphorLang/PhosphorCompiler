import { IntermediateSize } from '../intermediateSize';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class GlobalVariableIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.GlobalVariable;

    public readonly size: IntermediateSize;

    constructor (name: string, size: IntermediateSize)
    {
        super(name);

        this.kind = IntermediateSymbolKind.GlobalVariable;
        this.size = size;
    }
}
