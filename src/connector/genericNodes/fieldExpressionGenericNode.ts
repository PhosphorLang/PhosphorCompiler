import * as GenericSymbols from '../genericSymbols';
import { SemanticKind } from '../semanticKind';

export class FieldExpressionGenericNode <Expression, TypeLikeSymbol>
{
    public readonly kind: SemanticKind.FieldExpression;

    public readonly type: TypeLikeSymbol;

    public readonly field: GenericSymbols.Field<TypeLikeSymbol>;
    public readonly thisReference: Expression;

    constructor (field: GenericSymbols.Field<TypeLikeSymbol>, thisReference: Expression)
    {
        this.kind = SemanticKind.FieldExpression;

        this.type = field.type;

        this.field = field;
        this.thisReference = thisReference;
    }
}
