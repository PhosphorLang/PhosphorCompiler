import { SemanticKind } from '../semanticKind';

export class ArraySetExpressionGenericNode <Expression, TypeLike>
{
    public readonly kind: SemanticKind.ArraySetExpression;

    public readonly type: TypeLike;

    public readonly array: Expression;
    public readonly index: Expression;
    public readonly value: Expression;

    constructor (type: TypeLike, array: Expression, index: Expression, value: Expression)
    {
        this.kind = SemanticKind.ArraySetExpression;

        this.type = type;

        this.array = array;
        this.index = index;
        this.value = value;
    }
}
