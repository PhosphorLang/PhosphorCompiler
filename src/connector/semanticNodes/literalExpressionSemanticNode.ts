import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SemanticKind } from '../semanticKind';
import { TypeSemanticSymbol } from '../semanticSymbols/typeSemanticSymbol';

// TODO: Is there a better name for this to distinguish it more from the vector literal expression?
export class LiteralExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly value: string;

    constructor (value: string, type: TypeSemanticSymbol)
    {
        super(SemanticKind.LiteralExpression, type);

        this.value = value;
    }
}
