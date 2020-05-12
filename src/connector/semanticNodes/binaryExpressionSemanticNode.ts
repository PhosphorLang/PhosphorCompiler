import BinarySemanticOperator from "../semanticOperators/binarySemanticOperator";
import ExpressionSemanticNode from "./expressionSemanticNode";
import SemanticKind from "../semanticKind";

export default class BinaryExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly operator: BinarySemanticOperator;
    public leftOperand: ExpressionSemanticNode;
    public rightOperand: ExpressionSemanticNode;

    constructor (operator: BinarySemanticOperator, leftOperand: ExpressionSemanticNode, rightOperand: ExpressionSemanticNode)
    {
        super(SemanticKind.BinaryExpression, operator.resultType);

        this.operator = operator;
        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }
}
