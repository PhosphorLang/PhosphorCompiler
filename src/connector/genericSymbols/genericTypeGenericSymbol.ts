import * as GenericSymbols from '.';
import { GenericSymbolBase } from './genericSymbolBase';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class GenericTypeGenericSymbol<TypeLike> extends GenericSymbolBase
{
    public readonly kind: SemanticSymbolKind.GenericType;

    public readonly parameters: GenericSymbols.GenericTypeParameter<TypeLike>[] = [];

    constructor (namespace: Namespace, parameters: GenericSymbols.GenericTypeParameter<TypeLike>[])
    {
        super(namespace);

        this.kind = SemanticSymbolKind.GenericType;

        this.parameters = parameters;
    }
}
