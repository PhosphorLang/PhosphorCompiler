import * as GenericSymbols from '../genericSymbols';
import { SemanticKind } from '../semanticKind';

export class LiteralExpressionGenericNode<TypeLikeSymbol>
{
    public readonly kind: SemanticKind.LiteralExpression;

    public readonly type: GenericSymbols.ConcreteType<TypeLikeSymbol>;

    public readonly value: string;

    constructor (value: string, type: GenericSymbols.ConcreteType<TypeLikeSymbol>)
    {
        this.kind = SemanticKind.LiteralExpression;

        this.type = type;

        this.value = value;
    }
}
