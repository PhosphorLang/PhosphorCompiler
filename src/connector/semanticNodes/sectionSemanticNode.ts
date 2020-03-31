import SemanticKind from "../semanticKind";
import SemanticNode from "./semanticNode";

export default class SectionSemanticNode extends SemanticNode
{
    public readonly statements: SemanticNode[];

    constructor (statements: SemanticNode[])
    {
        super(SemanticKind.Section);

        this.statements = statements;
    }
}
