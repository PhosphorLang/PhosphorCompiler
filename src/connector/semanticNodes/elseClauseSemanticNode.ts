import IfStatementSemanticNode from "./ifStatementSemanticNode";
import SectionSemanticNode from "./sectionSemanticNode";
import SemanticKind from "../semanticKind";
import SemanticNode from "./semanticNode";

export default class ElseClauseSemanticNode extends SemanticNode
{
    public followUp: SectionSemanticNode|IfStatementSemanticNode;

    constructor (followUp: SectionSemanticNode|IfStatementSemanticNode)
    {
        super(SemanticKind.ElseClause);

        this.followUp = followUp;
    }
}
