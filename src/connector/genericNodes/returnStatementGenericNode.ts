import { SemanticKind } from '../semanticKind';

export class ReturnStatementGenericNode <Expression>
{
    public readonly kind: SemanticKind.ReturnStatement;

    public readonly expression: Expression|null;

    constructor (expression: Expression|null)
    {
        this.kind = SemanticKind.ReturnStatement;

        this.expression = expression;
    }
}
