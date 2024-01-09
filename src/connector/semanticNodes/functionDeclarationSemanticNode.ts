import * as SemanticNodes from '.';
import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class FunctionDeclarationSemanticNode
{
    public readonly kind: SemanticKind.Function;

    public readonly symbol: SemanticSymbols.Function;
    public section: SemanticNodes.Section|null;

    constructor (symbol: SemanticSymbols.Function, section: SemanticNodes.Section|null)
    {
        this.kind = SemanticKind.Function;

        this.symbol = symbol;
        this.section = section;
    }
}
