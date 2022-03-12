import ExpressionSemanticNode from './expressionSemanticNode';
import LabelSemanticSymbol from '../semanticSymbols/labelSemanticSymbol';
import SemanticKind from '../semanticKind';
import SemanticNode from './semanticNode';

export default class ConditionalGotoStatementSemanticNode extends SemanticNode
{
    public readonly labelSymbol: LabelSemanticSymbol;
    public condition: ExpressionSemanticNode;
    public conditionResult: boolean;

    /**
     * @param labelSymbol The label to go to.
     * @param condition The condition that is checked against.
     * @param conditionResult The result of the condition, meaning whether it must be true or false for the goto to being followed.
     */
    constructor (labelSymbol: LabelSemanticSymbol, condition: ExpressionSemanticNode, conditionResult = true)
    {
        super(SemanticKind.ConditionalGotoStatement);

        this.labelSymbol = labelSymbol;
        this.condition = condition;
        this.conditionResult = conditionResult;
    }
}
