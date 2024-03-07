import * as SemanticSymbols from '.';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolBase } from './SemanticSymbolBase';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class TypeConcreteParameterSemanticSymbol extends SemanticSymbolBase
{
    public readonly kind: SemanticSymbolKind.TypeConcreteParameter;

    public readonly type: SemanticSymbols.ConcreteType;

    constructor (namespace: Namespace, type: SemanticSymbols.ConcreteType)
    {
        super(namespace);

        this.kind = SemanticSymbolKind.TypeConcreteParameter;

        this.type = type;
    }
}
