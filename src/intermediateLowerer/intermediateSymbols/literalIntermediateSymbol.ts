import { IntermediateSize } from '../intermediateSize';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class LiteralIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.Literal;

    public readonly size: IntermediateSize;

    public get value (): string
    {
        return this.name;
    }

    constructor (value: string, size: IntermediateSize)
    {
        super(value);

        this.kind = IntermediateSymbolKind.Literal;

        this.size = size;
    }
}
