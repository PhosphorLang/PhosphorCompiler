import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class FunctionDeclarationGenericNode <Section>
{
    public readonly kind: SemanticKind.Function;

    public readonly symbol: SemanticSymbols.Function;
    public readonly section: Section|null;

    constructor (symbol: SemanticSymbols.Function, section: Section|null)
    {
        this.kind = SemanticKind.Function;

        this.symbol = symbol;
        this.section = section;
    }
}
