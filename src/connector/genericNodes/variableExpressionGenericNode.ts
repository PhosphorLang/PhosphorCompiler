import * as GenericSymbols from '../genericSymbols';
import { SemanticKind } from '../semanticKind';

export class VariableExpressionGenericNode<TypeLikeSymbol>
{
    public readonly kind: SemanticKind.VariableExpression;

    public readonly type: TypeLikeSymbol;

    public readonly variable: GenericSymbols.VariableLike<TypeLikeSymbol>;

    constructor (variable: GenericSymbols.VariableLike<TypeLikeSymbol>)
    {
        this.kind = SemanticKind.VariableExpression;

        this.type = variable.type;

        this.variable = variable;
    }
}
