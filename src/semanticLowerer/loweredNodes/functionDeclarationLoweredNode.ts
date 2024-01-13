import * as LoweredNodes from '../loweredNodes';
import * as LoweredSymbols from '../loweredSymbols';
import { SemanticKind } from '../../connector/semanticKind';

export class FunctionDeclarationLoweredNode
{
    // TODO: Should we have the symbol type be part of the FunctionDeclarationGenericNode instead of this class here?

    public readonly kind: SemanticKind.Function;

    public readonly symbol: LoweredSymbols.Function;
    public readonly section: LoweredNodes.Section|null;

    constructor (symbol: LoweredSymbols.Function, section: LoweredNodes.Section|null)
    {
        this.kind = SemanticKind.Function;

        this.symbol = symbol;
        this.section = section;
    }
}
