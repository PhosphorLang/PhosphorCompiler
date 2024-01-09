import { ConcreteTypeSemanticSymbol } from './concreteTypeSemanticSymbol';
import { SemanticSymbol } from './semanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class VariableSemanticSymbol extends SemanticSymbol
{
    public readonly type: ConcreteTypeSemanticSymbol;
    public readonly isReadonly: boolean;

    constructor (name: string, type: ConcreteTypeSemanticSymbol, isReadonly: boolean)
    {
        super(SemanticSymbolKind.Variable, name);

        this.type = type;
        this.isReadonly = isReadonly;
    }
}
