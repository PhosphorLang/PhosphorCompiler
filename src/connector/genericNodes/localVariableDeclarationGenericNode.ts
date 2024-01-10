import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class LocalVariableDeclarationGenericNode <Expression>
{
    public readonly kind: SemanticKind.LocalVariableDeclaration;

    public readonly symbol: SemanticSymbols.Variable;
    public readonly initialiser: Expression|null;

    constructor (symbol: SemanticSymbols.Variable, initialiser: Expression|null)
    {
        this.kind = SemanticKind.LocalVariableDeclaration;

        this.symbol = symbol;
        this.initialiser = initialiser;
    }
}
