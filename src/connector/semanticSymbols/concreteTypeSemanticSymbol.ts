import * as SemanticSymbols from '.';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolBase } from './SemanticSymbolBase';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class ConcreteTypeSemanticSymbol extends SemanticSymbolBase
{
    // TODO: Add size and unifiy it with the ones used in the intermediates and the transpilers.
    // TODO: The ConcreteType should reference the GenericType if it is derived from one.

    public readonly kind: SemanticSymbolKind.ConcreteType;

    public readonly parameters: SemanticSymbols.ConcreteParameter[] = [];

    constructor (namespace: Namespace, parameters: SemanticSymbols.ConcreteParameter[])
    {
        super(namespace);

        this.kind = SemanticSymbolKind.ConcreteType;

        this.parameters = parameters;
    }
}
