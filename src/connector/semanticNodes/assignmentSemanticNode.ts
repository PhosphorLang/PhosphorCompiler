import ExpressionSemanticNode from './expressionSemanticNode';
import SemanticKind from '../semanticKind';
import SemanticNode from './semanticNode';
import VariableSemanticSymbol from '../semanticSymbols/variableSemanticSymbol';

export default class AssignmentSemanticNode extends SemanticNode
{
    public readonly variable: VariableSemanticSymbol;
    public expression: ExpressionSemanticNode;

    constructor (variable: VariableSemanticSymbol, expression: ExpressionSemanticNode)
    {
        super(SemanticKind.Assignment);

        this.variable = variable;
        this.expression = expression;
    }
}
