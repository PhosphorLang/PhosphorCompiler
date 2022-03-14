import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SemanticKind } from '../semanticKind';
import { SemanticNode } from './semanticNode';

export class ReturnStatementSemanticNode extends SemanticNode
{
    public expression: ExpressionSemanticNode|null;

    constructor (expression: ExpressionSemanticNode|null)
    {
        super(SemanticKind.ReturnStatement);

        this.expression = expression;
    }
}
