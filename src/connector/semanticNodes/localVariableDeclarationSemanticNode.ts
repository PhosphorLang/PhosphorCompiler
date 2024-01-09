import * as SemanticNodes from '.';
import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class LocalVariableDeclarationSemanticNode
{
    public readonly kind: SemanticKind.LocalVariableDeclaration;

    public readonly symbol: SemanticSymbols.Variable;
    public initialiser: SemanticNodes.Expression|null;

    constructor (symbol: SemanticSymbols.Variable, initialiser: SemanticNodes.Expression|null)
    {
        this.kind = SemanticKind.LocalVariableDeclaration;

        this.symbol = symbol;
        this.initialiser = initialiser;
    }
}
