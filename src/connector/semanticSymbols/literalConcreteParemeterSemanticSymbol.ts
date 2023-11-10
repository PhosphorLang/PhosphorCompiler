import { ConcreteParameterSemanticSymbol } from './concreteParameterSemanticSymbol';
import { ConcreteTypeSemanticSymbol } from './concreteTypeSemanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class LiteralConcreteParameterSemanticSymbol extends ConcreteParameterSemanticSymbol
{
    public readonly value: string;

    constructor (name: string, value: string, type: ConcreteTypeSemanticSymbol)
    {
        super(SemanticSymbolKind.LiteralConcreteParameter, name, type);

        this.value = value;
    }

    public override equals (genericParameter: ConcreteParameterSemanticSymbol): boolean
    {
        if (this === genericParameter)
        {
            return true;
        }

        if (genericParameter instanceof LiteralConcreteParameterSemanticSymbol)
        {
            return (this.name == genericParameter.name) &&
                this.type.equals(genericParameter.type) &&
                (this.value == genericParameter.value);
        }
        else
        {
            return false;
        }
    }
}
