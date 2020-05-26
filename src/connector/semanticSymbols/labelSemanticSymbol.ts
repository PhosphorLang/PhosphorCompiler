import SemanticSymbol from "./semanticSymbol";
import SemanticSymbolKind from "../semanticSymbolKind";

export default class LabelSemanticSymbol extends SemanticSymbol
{
    constructor (name: string)
    {
        super(SemanticSymbolKind.Label, name);
    }
}
