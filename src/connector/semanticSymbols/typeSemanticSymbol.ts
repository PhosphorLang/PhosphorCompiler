import SemanticSymbol from "./semanticSymbol";
import SemanticSymbolKind from "../semanticSymbolKind";

export default class TypeSemanticSymbol extends SemanticSymbol
{
    constructor (name: string)
    {
        super(SemanticSymbolKind.Type, name);
    }
}
