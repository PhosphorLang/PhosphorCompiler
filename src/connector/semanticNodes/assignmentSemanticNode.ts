import * as SemanticNodes from '.';
import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class AssignmentSemanticNode
{
    public readonly kind: SemanticKind.Assignment;

    public readonly variable: SemanticSymbols.Variable;
    public expression: SemanticNodes.Expression;

    constructor (variable: SemanticSymbols.Variable, expression: SemanticNodes.Expression)
    {
        this.kind = SemanticKind.Assignment;

        this.variable = variable;
        this.expression = expression;
    }
}
