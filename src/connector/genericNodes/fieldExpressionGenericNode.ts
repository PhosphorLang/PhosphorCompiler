import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class FieldExpressionGenericNode
{
    public readonly kind: SemanticKind.FieldExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly field: SemanticSymbols.Field;

    constructor (field: SemanticSymbols.Field)
    {
        this.kind = SemanticKind.FieldExpression;

        this.type = field.type;

        this.field = field;
    }
}
