import { LabelSemanticSymbol } from '../semanticSymbols/labelSemanticSymbol';
import { SemanticKind } from '../semanticKind';
import { SemanticNode } from './semanticNode';

export class LabelSemanticNode extends SemanticNode
{
    public readonly symbol: LabelSemanticSymbol;

    constructor (symbol: LabelSemanticSymbol)
    {
        super(SemanticKind.Label);

        this.symbol = symbol;
    }
}
