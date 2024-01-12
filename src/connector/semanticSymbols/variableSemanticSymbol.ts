import * as SemanticSymbols from '.';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolBase } from './SemanticSymbolBase';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class VariableSemanticSymbol extends SemanticSymbolBase
{
    public readonly kind: SemanticSymbolKind.Variable;

    public readonly type: SemanticSymbols.ConcreteType;
    public readonly isReadonly: boolean;

    constructor (namespace: Namespace, type: SemanticSymbols.ConcreteType, isReadonly: boolean)
    {
        super(namespace);

        this.kind = SemanticSymbolKind.Variable;

        this.type = type;
        this.isReadonly = isReadonly;
    }
}
