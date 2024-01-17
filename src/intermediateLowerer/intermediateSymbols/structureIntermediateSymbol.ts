import { FieldIntermediateSymbol } from './fieldIntermediateSymbol';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class StructureIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.Structure;

    /**
     * NOTE: The index of every field in this array must match the value of the field symbol's "index" property.
     */
    public readonly fields: FieldIntermediateSymbol[];

    constructor (name: string, fields: FieldIntermediateSymbol[])
    {
        super(name);

        this.kind = IntermediateSymbolKind.Structure;

        this.fields = fields;
    }
}
