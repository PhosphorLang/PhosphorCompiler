import * as SemanticSymbols from '../../connector/semanticSymbols';
import { SemanticKind } from '../../connector/semanticKind';

export class LabelLoweredNode
{
    public readonly kind: SemanticKind.Label;

    public readonly symbol: SemanticSymbols.Label;

    constructor (symbol: SemanticSymbols.Label)
    {
        this.kind = SemanticKind.Label;

        this.symbol = symbol;
    }
}
