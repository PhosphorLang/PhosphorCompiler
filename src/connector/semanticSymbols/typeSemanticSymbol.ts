import { SemanticSymbol } from './semanticSymbol';

export abstract class TypeSemanticSymbol extends SemanticSymbol
{
    // TODO: Add size and unifiy it with the ones used in the intermediates and the transpilers.

    // @ts-expect-error Workaround to enable static typing for this class.
    private staticTyping = true;

    public abstract equals (type: TypeSemanticSymbol): boolean;
}
