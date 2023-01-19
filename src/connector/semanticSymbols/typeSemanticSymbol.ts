import { SemanticSymbol } from './semanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class TypeSemanticSymbol extends SemanticSymbol
{
    // TODO: Add size and unifiy it with the ones used in the intermediates and the transpilers.

    constructor (name: string)
    {
        super(SemanticSymbolKind.Type, name);
    }

    public equals (type: TypeSemanticSymbol): boolean
    {
        if (this === type)
        {
            return true;
        }

        if (this.constructor === type.constructor)
        {
            return this.name === type.name;
        }

        return false;
    }
}
