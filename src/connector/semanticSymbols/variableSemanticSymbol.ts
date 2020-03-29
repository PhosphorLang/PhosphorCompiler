import SemanticSymbol from "./semanticSymbol";
import SemanticSymbolKind from "../semanticSymbolKind";
import TypeSemanticSymbol from "./typeSemanticSymbol";

export default class VariableSemanticSymbol extends SemanticSymbol
{
    public readonly isReadonly: boolean;
    public readonly type: TypeSemanticSymbol;

    constructor (name: string, type: TypeSemanticSymbol, isReadonly: boolean)
    {
        super(SemanticSymbolKind.Variable, name);

        this.type = type;
        this.isReadonly = isReadonly;
    }
}
