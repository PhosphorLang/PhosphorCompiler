import * as GenericSymbols from '.';
import { GenericSymbolBase } from './genericSymbolBase';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class GenericTypeParameterGenericSymbol<TypeLike> extends GenericSymbolBase
{
    public readonly kind: SemanticSymbolKind.GenericTypeParameter;

    public readonly constraint: GenericSymbols.ConcreteType<TypeLike>|null;
    public readonly isConstant: boolean;

    constructor (namespace: Namespace, constraint: GenericSymbols.ConcreteType<TypeLike>|null, isConstant: boolean)
    {
        super(namespace);

        this.kind = SemanticSymbolKind.GenericTypeParameter;

        this.constraint = constraint;
        this.isConstant = isConstant;
    }
}
