import * as GenericSymbols from '../genericSymbols';
import { SemanticKind } from '../semanticKind';

export class LocalVariableDeclarationGenericNode <Expression, TypeLikeSymbol>
{
    public readonly kind: SemanticKind.LocalVariableDeclaration;

    public readonly symbol: GenericSymbols.Variable<TypeLikeSymbol>;
    public readonly initialiser: Expression|null;

    constructor (symbol: GenericSymbols.Variable<TypeLikeSymbol>, initialiser: Expression|null)
    {
        this.kind = SemanticKind.LocalVariableDeclaration;

        this.symbol = symbol;
        this.initialiser = initialiser;
    }
}
