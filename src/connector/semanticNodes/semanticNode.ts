import SemanticKind from "../semanticKind";

export default abstract class SemanticNode
{
    public readonly kind: SemanticKind;

    constructor (kind: SemanticKind)
    {
        this.kind = kind;
    }
}
