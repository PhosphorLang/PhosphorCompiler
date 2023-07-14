import { ParameterSemanticSymbol } from './parameterSemanticSymbol';
import { SemanticSymbol } from './semanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';
import { TypeSemanticSymbol } from './typeSemanticSymbol';

export class FunctionSemanticSymbol extends SemanticSymbol
{
    public readonly parameters: ParameterSemanticSymbol[];
    public readonly returnType: TypeSemanticSymbol;
    public readonly isHeader: boolean;

    constructor (name: string, returnType: TypeSemanticSymbol, parameters: ParameterSemanticSymbol[], isHeader: boolean)
    {
        super(SemanticSymbolKind.Function, name);

        this.returnType = returnType;
        this.parameters = parameters;
        this.isHeader = isHeader;
    }
}
