import * as SemanticNodes from '.';
import { SemanticKind } from '../semanticKind';

export class ReturnStatementSemanticNode
{
    public readonly kind: SemanticKind.ReturnStatement;

    public expression: SemanticNodes.Expression|null;

    constructor (expression: SemanticNodes.Expression|null)
    {
        this.kind = SemanticKind.ReturnStatement;

        this.expression = expression;
    }
}
