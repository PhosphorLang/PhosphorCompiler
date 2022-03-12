import LabelSemanticSymbol from '../semanticSymbols/labelSemanticSymbol';
import SemanticKind from '../semanticKind';
import SemanticNode from './semanticNode';

export default class GotoStatementSemanticNode extends SemanticNode
{
    public readonly labelSymbol: LabelSemanticSymbol;

    constructor (labelSymbol: LabelSemanticSymbol)
    {
        super(SemanticKind.GotoStatement);

        this.labelSymbol = labelSymbol;
    }
}
