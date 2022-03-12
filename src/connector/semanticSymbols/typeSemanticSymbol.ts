import SemanticSymbol from './semanticSymbol';
import SemanticSymbolKind from '../semanticSymbolKind';

export default class TypeSemanticSymbol extends SemanticSymbol
{
    // TODO: Add size and unifiy it with the ones used in the intermediates and the transpilers.

    constructor (name: string)
    {
        super(SemanticSymbolKind.Type, name);
    }
}
