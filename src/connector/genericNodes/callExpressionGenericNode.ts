import * as GenericSymbols from '../genericSymbols';
import { SemanticKind } from '../semanticKind';

export class CallExpressionGenericNode <Expression, TypeLikeSymbol>
{
    public readonly kind: SemanticKind.CallExpression;

    public readonly type: TypeLikeSymbol;

    public readonly functionSymbol: GenericSymbols.Function<TypeLikeSymbol>;
    public readonly arguments: Expression[];
    public readonly thisReference: Expression|null;

    constructor (
        functionSymbol: GenericSymbols.Function<TypeLikeSymbol>,
        callArguments: Expression[],
        thisReference: Expression|null
    ){
        this.kind = SemanticKind.CallExpression;

        this.type = functionSymbol.returnType;

        this.functionSymbol = functionSymbol;
        this.arguments = callArguments;
        this.thisReference = thisReference;
    }
}
