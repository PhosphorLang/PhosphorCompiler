import * as GenericSymbols from '../genericSymbols';
import { SemanticKind } from '../semanticKind';

export class FunctionDeclarationGenericNode <Section, TypeLikeSymbol>
{
    public readonly kind: SemanticKind.Function;

    public readonly symbol: GenericSymbols.Function<TypeLikeSymbol>;
    public readonly section: Section|null;

    constructor (symbol: GenericSymbols.Function<TypeLikeSymbol>, section: Section|null)
    {
        this.kind = SemanticKind.Function;

        this.symbol = symbol;
        this.section = section;
    }
}
