import { GenericSymbolBase } from './genericSymbolBase';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class ConcreteTypeGenericSymbol<TypeLike> extends GenericSymbolBase
{
    public readonly kind: SemanticSymbolKind.ConcreteType;

    public readonly parameters: TypeLike[] = [];

    constructor (namespace: Namespace, parameters: TypeLike[])
    {
        super(namespace);

        this.kind = SemanticSymbolKind.ConcreteType;

        this.parameters = parameters;
    }
}
