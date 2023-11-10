import { ConcreteTypeSemanticSymbol } from './concreteTypeSemanticSymbol';
import { SemanticSymbol } from './semanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export abstract class ConcreteParameterSemanticSymbol extends SemanticSymbol
{
    // @ts-expect-error Workaround to enable static typing for this class.
    private staticTyping = true;

    public readonly type: ConcreteTypeSemanticSymbol;

    constructor (kind: SemanticSymbolKind, name: string, type: ConcreteTypeSemanticSymbol)
    {
        super(kind, name);

        this.type = type;
    }

    public abstract equals (genericParameter: ConcreteParameterSemanticSymbol): boolean;
}
