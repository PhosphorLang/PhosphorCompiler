import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class GlobalVariableDeclarationGenericNode <Expression>
{
    public readonly kind: SemanticKind.GlobalVariableDeclaration;

    public readonly symbol: SemanticSymbols.Variable;
    public readonly initialiser: Expression|null;

    constructor (symbol: SemanticSymbols.Variable, initialiser: Expression|null)
    {
        this.kind = SemanticKind.GlobalVariableDeclaration;

        this.symbol = symbol;
        this.initialiser = initialiser;
    }
}
