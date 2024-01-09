import * as SemanticNodes from '.';
import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class GlobalVariableDeclarationSemanticNode
{
    public readonly kind: SemanticKind.GlobalVariableDeclaration;

    public readonly symbol: SemanticSymbols.Variable;
    public initialiser: SemanticNodes.Expression|null;

    constructor (symbol: SemanticSymbols.Variable, initialiser: SemanticNodes.Expression|null)
    {
        this.kind = SemanticKind.GlobalVariableDeclaration;

        this.symbol = symbol;
        this.initialiser = initialiser;
    }
}
