import { SemanticKind } from '../semanticKind';

export class FreeStatementGenericNode <Expression>
{
    public readonly kind: SemanticKind.FreeStatement;

    public readonly expression: Expression;

    constructor (expression: Expression)
    {
        this.kind = SemanticKind.FreeStatement;

        this.expression = expression;
    }
}
