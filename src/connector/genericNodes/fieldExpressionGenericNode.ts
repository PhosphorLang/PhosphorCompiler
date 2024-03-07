import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class FieldExpressionGenericNode <Expression>
{
    public readonly kind: SemanticKind.FieldExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly field: SemanticSymbols.Field;
    public readonly thisReference: Expression;

    constructor (field: SemanticSymbols.Field, thisReference: Expression)
    {
        this.kind = SemanticKind.FieldExpression;

        this.type = field.type;

        this.field = field;
        this.thisReference = thisReference;
    }
}
