import * as SemanticSymbols from '../../connector/semanticSymbols';
import { SemanticKind } from '../../connector/semanticKind';

export class GotoStatementLoweredNode
{
    public readonly kind: SemanticKind.GotoStatement;

    public readonly labelSymbol: SemanticSymbols.Label;

    constructor (labelSymbol: SemanticSymbols.Label)
    {
        this.kind = SemanticKind.GotoStatement;

        this.labelSymbol = labelSymbol;
    }
}
