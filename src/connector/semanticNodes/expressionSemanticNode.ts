import { SemanticKind } from '../semanticKind';
import { SemanticNode } from './semanticNode';
import { TypeSemanticSymbol } from '../semanticSymbols/typeSemanticSymbol';

export abstract class ExpressionSemanticNode extends SemanticNode
{
    // @ts-expect-error Workaround to enable static typing for this class.
    private staticTyping = true;

    public readonly type: TypeSemanticSymbol;

    constructor (kind: SemanticKind, type: TypeSemanticSymbol)
    {
        super(kind);

        this.type = type;
    }
}
