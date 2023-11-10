import { GenericParameterSemanticSymbol } from './genericParameterSemanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';
import { TypeSemanticSymbol } from './typeSemanticSymbol';

export class GenericTypeSemanticSymbol extends TypeSemanticSymbol
{
    public readonly parameters: GenericParameterSemanticSymbol[] = [];

    constructor (name: string, parameters: GenericParameterSemanticSymbol[])
    {
        super(SemanticSymbolKind.GenericType, name);

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

        if (!(type instanceof GenericTypeSemanticSymbol))
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
