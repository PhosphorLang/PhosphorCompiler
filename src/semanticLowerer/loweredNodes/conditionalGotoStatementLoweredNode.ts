import * as LoweredNodes from '.';
import * as SemanticSymbols from '../../connector/semanticSymbols';
import { SemanticKind } from '../../connector/semanticKind';

export class ConditionalGotoStatementLoweredNode
{
    public readonly kind: SemanticKind.ConditionalGotoStatement;

    public readonly labelSymbol: SemanticSymbols.Label;
    public condition: LoweredNodes.Expression;
    public conditionResult: boolean;

    /**
     * @param labelSymbol The label to go to.
     * @param condition The condition that is checked against.
     * @param conditionResult The result of the condition, meaning whether it must be true or false for the goto to being followed.
     */
    constructor (labelSymbol: SemanticSymbols.Label, condition: LoweredNodes.Expression, conditionResult = true)
    {
        this.kind = SemanticKind.ConditionalGotoStatement;

        this.labelSymbol = labelSymbol;
        this.condition = condition;
        this.conditionResult = conditionResult;
    }
}
