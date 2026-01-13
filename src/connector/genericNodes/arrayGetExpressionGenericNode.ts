import { SemanticKind } from '../semanticKind';

export class ArrayGetExpressionGenericNode <Expression, TypeLike>
{
    public readonly kind: SemanticKind.ArrayGetExpression;

    public readonly type: TypeLike;

    public readonly array: Expression;
    public readonly index: Expression;

    constructor (type: TypeLike, array: Expression, index: Expression)
    {
        this.kind = SemanticKind.ArrayGetExpression;

        this.type = type;

        this.array = array;
        this.index = index;
    }
}
