import { ConcreteTypeSemanticSymbol } from '../semanticSymbols/concreteTypeSemanticSymbol';
import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SemanticKind } from '../semanticKind';

// TODO: Is there a better name for this to distinguish it more from the vector literal expression?
export class LiteralExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly value: string;

    constructor (value: string, type: ConcreteTypeSemanticSymbol)
    {
        super(SemanticKind.LiteralExpression, type);

        this.value = value;
    }
}
