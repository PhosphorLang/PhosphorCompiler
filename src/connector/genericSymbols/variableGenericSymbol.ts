import { GenericSymbolBase } from './genericSymbolBase';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class VariableGenericSymbol<TypeLike> extends GenericSymbolBase
{
    public readonly kind: SemanticSymbolKind.Variable;

    public readonly type: TypeLike;
    public readonly isReadonly: boolean;

    constructor (namespace: Namespace, type: TypeLike, isReadonly: boolean)
    {
        super(namespace);

        this.kind = SemanticSymbolKind.Variable;

        this.type = type;
        this.isReadonly = isReadonly;
    }
}
