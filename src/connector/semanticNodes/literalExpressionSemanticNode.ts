import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SemanticKind } from '../semanticKind';
import { TypeSemanticSymbol } from '../semanticSymbols/typeSemanticSymbol';

export class LiteralExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly value: string;

    constructor (value: string, type: TypeSemanticSymbol)
    {
        super(SemanticKind.LiteralExpression, type);

        this.value = value;
    }
}
