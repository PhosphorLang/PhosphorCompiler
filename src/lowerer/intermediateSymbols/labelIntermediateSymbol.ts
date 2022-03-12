import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class LabelIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.Label;

    constructor (name: string)
    {
        super(name);

        this.kind = IntermediateSymbolKind.Label;
    }
}
