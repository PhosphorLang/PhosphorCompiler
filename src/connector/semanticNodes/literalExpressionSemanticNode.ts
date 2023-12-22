import { ConcreteTypeSemanticSymbol } from '../semanticSymbols/concreteTypeSemanticSymbol';
import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SemanticKind } from '../semanticKind';

export class LiteralExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly value: string;

    constructor (value: string, type: ConcreteTypeSemanticSymbol)
    {
        super(SemanticKind.LiteralExpression, type);

        this.value = value;
    }
}
