import { ConcreteParameterSemanticSymbol } from './concreteParameterSemanticSymbol';
import { ConcreteTypeSemanticSymbol } from './concreteTypeSemanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class TypeConcreteParameterSemanticSymbol extends ConcreteParameterSemanticSymbol
{
    constructor (name: string, type: ConcreteTypeSemanticSymbol)
    {
        super(SemanticSymbolKind.TypeConcreteParameter, name, type);
    }

    public override equals (genericParameter: ConcreteParameterSemanticSymbol): boolean
    {
        if (this === genericParameter)
        {
            return true;
        }

        if (genericParameter instanceof TypeConcreteParameterSemanticSymbol)
        {
            return (this.name == genericParameter.name) && this.type.equals(genericParameter.type);
        }
        else
        {
            return false;
        }
    }
}
