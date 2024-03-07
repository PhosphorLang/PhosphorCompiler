import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class FieldDeclarationGenericNode <Expression>
{
    public readonly kind: SemanticKind.FieldDeclaration;

    public readonly symbol: SemanticSymbols.Field;
    public readonly initialiser: Expression|null;

    constructor (symbol: SemanticSymbols.Field, initialiser: Expression|null)
    {
        this.kind = SemanticKind.FieldDeclaration;

        this.symbol = symbol;
        this.initialiser = initialiser;
    }
}
