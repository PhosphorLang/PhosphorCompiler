import { Namespace } from '../../parser/namespace';
import { SemanticSymbolBase } from './SemanticSymbolBase';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class GenericParameterSemanticSymbol extends SemanticSymbolBase
{
    public readonly kind: SemanticSymbolKind.GenericParameter;

    public readonly isLiteral: boolean;

    constructor (namespace: Namespace, isLiteral: boolean)
    {
        super(namespace);

        this.kind = SemanticSymbolKind.GenericParameter;

        this.isLiteral = isLiteral;
    }
}
