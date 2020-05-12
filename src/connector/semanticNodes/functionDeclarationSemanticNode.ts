import FunctionSemanticSymbol from "../semanticSymbols/functionSemanticSymbol";
import SectionSemanticNode from "./sectionSemanticNode";
import SemanticKind from "../semanticKind";
import SemanticNode from "./semanticNode";

export default class FunctionDeclarationSemanticNode extends SemanticNode
{
    public readonly symbol: FunctionSemanticSymbol;
    public section: SectionSemanticNode;

    constructor (symbol: FunctionSemanticSymbol, section: SectionSemanticNode)
    {
        super(SemanticKind.Function);

        this.symbol = symbol;
        this.section = section;
    }
}
