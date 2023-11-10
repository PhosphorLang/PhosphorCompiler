import { ConcreteTypeSemanticSymbol } from '../semanticSymbols/concreteTypeSemanticSymbol';
import { SemanticKind } from '../semanticKind';
import { SemanticNode } from './semanticNode';

export abstract class ExpressionSemanticNode extends SemanticNode
{
    // @ts-expect-error Workaround to enable static typing for this class.
    private staticTyping = true;

    public readonly type: ConcreteTypeSemanticSymbol;

    constructor (kind: SemanticKind, type: ConcreteTypeSemanticSymbol)
    {
        super(kind);

        this.type = type;
    }
}
