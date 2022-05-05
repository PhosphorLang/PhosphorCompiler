import { FunctionSemanticSymbol } from '../semanticSymbols/functionSemanticSymbol';
import { SectionSemanticNode } from './sectionSemanticNode';
import { SemanticKind } from '../semanticKind';
import { SemanticNode } from './semanticNode';

export class FunctionDeclarationSemanticNode extends SemanticNode
{
    public readonly symbol: FunctionSemanticSymbol;
    public section: SectionSemanticNode|null;

    constructor (symbol: FunctionSemanticSymbol, section: SectionSemanticNode|null)
    {
        super(SemanticKind.Function);

        this.symbol = symbol;
        this.section = section;
    }
}
