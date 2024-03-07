import * as SemanticSymbols from '.';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolBase } from './SemanticSymbolBase';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class GenericTypeSemanticSymbol extends SemanticSymbolBase
{
    public readonly kind: SemanticSymbolKind.GenericType;

    public readonly parameters: SemanticSymbols.GenericParameter[] = [];

    constructor (namespace: Namespace, parameters: SemanticSymbols.GenericParameter[])
    {
        super(namespace);

        this.kind = SemanticSymbolKind.GenericType;

        this.parameters = parameters;
    }
}
