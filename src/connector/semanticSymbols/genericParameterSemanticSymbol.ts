import { SemanticSymbol } from './semanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class GenericParameterSemanticSymbol extends SemanticSymbol
{
    public readonly isLiteral: boolean;

    constructor (name: string, isLiteral: boolean)
    {
        super(SemanticSymbolKind.GenericParameter, name);

        this.isLiteral = isLiteral;
    }

    public equals (genericParameter: GenericParameterSemanticSymbol): boolean
    {
        if (this === genericParameter)
        {
            return true;
        }

        return (this.name === genericParameter.name) && (this.isLiteral === genericParameter.isLiteral);
    }
}
