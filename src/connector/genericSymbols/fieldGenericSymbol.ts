import { GenericSymbolBase } from './genericSymbolBase';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class FieldGenericSymbol<TypeLike> extends GenericSymbolBase
{
    public readonly kind: SemanticSymbolKind.Field;

    public readonly type: TypeLike;
    public readonly isReadonly: boolean;

    constructor (namespace: Namespace, type: TypeLike, isReadonly: boolean)
    {
        super(namespace);

        this.kind = SemanticSymbolKind.Field;

        this.type = type;
        this.isReadonly = isReadonly;
    }
}
