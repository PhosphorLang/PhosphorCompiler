import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SemanticKind } from '../semanticKind';
import { VectorTypeSemanticSymbol } from '../semanticSymbols/vectorTypeSemanticSymbol';

export class VectorLiteralExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly elements: ExpressionSemanticNode[];

    public override readonly type: VectorTypeSemanticSymbol;

    constructor (elements: ExpressionSemanticNode[], type: VectorTypeSemanticSymbol)
    {
        super(SemanticKind.VectorLiteralExpression, type);

        this.type = type;
        this.elements = elements;
    }
}
