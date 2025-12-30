import { SemanticKind } from '../semanticKind';

export class InstantiationExpressionGenericNode <Expression, TypeLikeSymbol>
{
    public readonly kind: SemanticKind.InstantiationExpression;

    public readonly type: TypeLikeSymbol;

    public readonly arguments: Expression[];

    constructor (type: TypeLikeSymbol, constructorArguments: Expression[])
    {
        this.kind = SemanticKind.InstantiationExpression;

        this.type = type;

        this.arguments = constructorArguments;
    }
}
