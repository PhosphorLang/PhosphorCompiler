import { GenericSymbolBase } from './genericSymbolBase';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class LabelGenericSymbol extends GenericSymbolBase
{
    public readonly kind: SemanticSymbolKind.Label;

    constructor (namespace: Namespace)
    {
        super(namespace);

        this.kind = SemanticSymbolKind.Label;
    }
}
