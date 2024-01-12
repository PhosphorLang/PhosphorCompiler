import { Namespace } from '../../parser/namespace';
import { SemanticSymbolBase } from './SemanticSymbolBase';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class LabelSemanticSymbol extends SemanticSymbolBase
{
    public readonly kind: SemanticSymbolKind.Label;

    constructor (namespace: Namespace)
    {
        super(namespace);

        this.kind = SemanticSymbolKind.Label;
    }
}
