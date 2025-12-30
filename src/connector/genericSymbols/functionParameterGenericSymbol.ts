import { GenericSymbolBase } from './genericSymbolBase';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class FunctionParameterGenericSymbol<TypeLike> extends GenericSymbolBase
{
    public readonly kind: SemanticSymbolKind.FunctionParameter;

    public readonly type: TypeLike;
    public readonly isReadonly: true;

    constructor (namespace: Namespace, type: TypeLike)
    {
        super(namespace);

        this.kind = SemanticSymbolKind.FunctionParameter;

        this.isReadonly = true;

        this.type = type;
    }
}
