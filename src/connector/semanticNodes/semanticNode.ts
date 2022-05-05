import { SemanticKind } from '../semanticKind';

export abstract class SemanticNode
{
    public readonly kind: SemanticKind;

    constructor (kind: SemanticKind)
    {
        this.kind = kind;
    }
}
