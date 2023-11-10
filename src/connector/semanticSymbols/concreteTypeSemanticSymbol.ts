import { ConcreteParameterSemanticSymbol } from './concreteParameterSemanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';
import { TypeSemanticSymbol } from './typeSemanticSymbol';

export class ConcreteTypeSemanticSymbol extends TypeSemanticSymbol
{
    // TODO: Add size and unifiy it with the ones used in the intermediates and the transpilers.
    // TODO: The ConcreteType should reference the GenericType if it is derived from one.

    public readonly parameters: ConcreteParameterSemanticSymbol[] = [];

    constructor (name: string, parameters: ConcreteParameterSemanticSymbol[])
    {
        super(SemanticSymbolKind.ConcreteType, name);

        this.parameters = parameters;
    }

    public override equals (type: TypeSemanticSymbol): boolean
    {
        if (this === type)
        {
            return true;
        }

        if (this.name !== type.name)
        {
            return false;
        }

        if (!(type instanceof ConcreteTypeSemanticSymbol))
        {
            return false;
        }

        if (this.parameters.length !== type.parameters.length)
        {
            return false;
        }

        for (let i = 0; i < this.parameters.length; i++)
        {
            if (!this.parameters[i].equals(type.parameters[i]))
            {
                return false;
            }
        }

        return true;
    }
}
