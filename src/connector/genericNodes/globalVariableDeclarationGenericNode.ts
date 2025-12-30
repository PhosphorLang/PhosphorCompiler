import * as GenericSymbols from '../genericSymbols';
import { SemanticKind } from '../semanticKind';

export class GlobalVariableDeclarationGenericNode <Expression, TypeLikeSymbol>
{
    public readonly kind: SemanticKind.GlobalVariableDeclaration;

    public readonly symbol: GenericSymbols.Variable<TypeLikeSymbol>;
    public readonly initialiser: Expression|null;

    constructor (symbol: GenericSymbols.Variable<TypeLikeSymbol>, initialiser: Expression|null)
    {
        this.kind = SemanticKind.GlobalVariableDeclaration;

        this.symbol = symbol;
        this.initialiser = initialiser;
    }
}
