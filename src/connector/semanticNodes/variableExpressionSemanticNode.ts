import ExpressionSemanticNode from "./expressionSemanticNode";
import SemanticKind from "../semanticKind";
import VariableSemanticSymbol from "../semanticSymbols/variableSemanticSymbol";

export default class VariableExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly variable: VariableSemanticSymbol;

    constructor (variable: VariableSemanticSymbol)
    {
        super(SemanticKind.VariableExpression, variable.type);

        this.variable = variable;
    }
}
