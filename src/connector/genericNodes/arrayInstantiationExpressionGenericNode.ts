import { SemanticKind } from '../semanticKind';

export class ArrayInstantiationExpressionGenericNode <Expression, TypeLike>
{
    public readonly kind: SemanticKind.ArrayInstantiationExpression;

    public readonly type: TypeLike;

    public readonly elementType: TypeLike;
    public readonly sizeArgument: Expression;

    constructor (type: TypeLike, elementType: TypeLike, sizeArgument: Expression)
    {
        this.kind = SemanticKind.ArrayInstantiationExpression;

        this.type = type;

        this.elementType = elementType;
        this.sizeArgument = sizeArgument;
    }
}
