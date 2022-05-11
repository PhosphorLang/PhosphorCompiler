import { ArrayTypeSemanticSymbol } from '../semanticSymbols/arrayTypeSemanticSymbol';
import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SemanticKind } from '../semanticKind';

export class ArrayLiteralExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly elements: ExpressionSemanticNode[];

    public override readonly type: ArrayTypeSemanticSymbol;

    constructor (elements: ExpressionSemanticNode[], type: ArrayTypeSemanticSymbol)
    {
        super(SemanticKind.ArrayLiteralExpression, type);

        this.type = type;
        this.elements = elements;
    }
}
