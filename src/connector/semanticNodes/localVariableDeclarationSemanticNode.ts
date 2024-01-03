import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SemanticKind } from '../semanticKind';
import { SemanticNode } from './semanticNode';
import { VariableSemanticSymbol } from '../semanticSymbols/variableSemanticSymbol';

export class LocalVariableDeclarationSemanticNode extends SemanticNode
{
    public readonly symbol: VariableSemanticSymbol;
    public initialiser: ExpressionSemanticNode|null;

    constructor (symbol: VariableSemanticSymbol, initialiser: ExpressionSemanticNode|null)
    {
        super(SemanticKind.LocalVariableDeclaration);

        this.symbol = symbol;
        this.initialiser = initialiser;
    }
}
