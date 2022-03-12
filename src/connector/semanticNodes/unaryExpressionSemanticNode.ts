import ExpressionSemanticNode from './expressionSemanticNode';
import SemanticKind from '../semanticKind';
import UnarySemanticOperator from '../semanticOperators/unarySemanticOperator';

export default class UnaryExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly operator: UnarySemanticOperator;
    public operand: ExpressionSemanticNode;

    constructor (operator: UnarySemanticOperator, operand: ExpressionSemanticNode)
    {
        super(SemanticKind.UnaryExpression, operator.resultType);

        this.operator = operator;
        this.operand = operand;
    }
}
