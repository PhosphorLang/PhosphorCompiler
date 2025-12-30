import * as GenericSymbols from '../genericSymbols';
import { SemanticKind } from '../semanticKind';

export class FieldDeclarationGenericNode <Expression, TypeLikeSymbol>
{
    public readonly kind: SemanticKind.FieldDeclaration;

    public readonly symbol: GenericSymbols.Field<TypeLikeSymbol>;
    public readonly initialiser: Expression|null;

    constructor (symbol: GenericSymbols.Field<TypeLikeSymbol>, initialiser: Expression|null)
    {
        this.kind = SemanticKind.FieldDeclaration;

        this.symbol = symbol;
        this.initialiser = initialiser;
    }
}
