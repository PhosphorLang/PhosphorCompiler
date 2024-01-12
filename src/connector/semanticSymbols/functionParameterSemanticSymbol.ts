import * as SemanticSymbols from '.';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolBase } from './SemanticSymbolBase';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class FunctionParameterSemanticSymbol extends SemanticSymbolBase
{
    public readonly kind: SemanticSymbolKind.FunctionParameter;

    public readonly type: SemanticSymbols.ConcreteType;
    public readonly isReadonly: true;

    constructor (namespace: Namespace, type: SemanticSymbols.ConcreteType)
    {
        super(namespace);

        this.kind = SemanticSymbolKind.FunctionParameter;

        this.isReadonly = true;

        this.type = type;
    }
}
