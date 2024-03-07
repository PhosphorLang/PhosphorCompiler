import * as SemanticSymbols from '.';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolBase } from './SemanticSymbolBase';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class LiteralConcreteParameterSemanticSymbol extends SemanticSymbolBase
{
    public readonly kind: SemanticSymbolKind.LiteralConcreteParameter;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly value: string;

    constructor (namespace: Namespace, value: string, type: SemanticSymbols.ConcreteType)
    {
        super(namespace);

        this.kind = SemanticSymbolKind.LiteralConcreteParameter;

        this.value = value;
        this.type = type;
    }
}
