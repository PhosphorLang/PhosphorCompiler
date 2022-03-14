import { SemanticSymbolKind } from '../semanticSymbolKind';

export abstract class SemanticSymbol
{
    public readonly name: string;
    public readonly kind: SemanticSymbolKind;

    constructor (kind: SemanticSymbolKind, name: string)
    {
        this.kind = kind;
        this.name = name;
    }
}
