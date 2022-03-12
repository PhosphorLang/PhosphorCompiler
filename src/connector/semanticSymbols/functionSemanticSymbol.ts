import ParameterSemanticSymbol from './parameterSemanticSymbol';
import SemanticSymbol from './semanticSymbol';
import SemanticSymbolKind from '../semanticSymbolKind';
import TypeSemanticSymbol from './typeSemanticSymbol';

export default class FunctionSemanticSymbol extends SemanticSymbol
{
    public readonly parameters: ParameterSemanticSymbol[];
    public readonly returnType: TypeSemanticSymbol;
    public readonly isExternal: boolean;

    constructor (name: string, returnType: TypeSemanticSymbol, parameters: ParameterSemanticSymbol[], isExternal: boolean)
    {
        super(SemanticSymbolKind.Function, name);

        this.returnType = returnType;
        this.parameters = parameters;
        this.isExternal = isExternal;
    }
}
