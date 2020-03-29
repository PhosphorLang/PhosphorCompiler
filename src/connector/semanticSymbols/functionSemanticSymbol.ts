import ParameterSemanticSymbol from "./parameterSemanticSymbol";
import SemanticSymbol from "./semanticSymbol";
import SemanticSymbolKind from "../semanticSymbolKind";
import TypeSemanticSymbol from "./typeSemanticSymbol";

export default class FunctionSemanticSymbol extends SemanticSymbol
{
    public readonly parameters: ParameterSemanticSymbol[];
    public readonly returnType: TypeSemanticSymbol;

    constructor (name: string, returnType: TypeSemanticSymbol, parameters: ParameterSemanticSymbol[])
    {
        super(SemanticSymbolKind.Function, name);

        this.returnType = returnType;
        this.parameters = parameters;
    }
}
