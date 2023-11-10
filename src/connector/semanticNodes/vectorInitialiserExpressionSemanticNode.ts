import { ConcreteType } from '../semanticSymbols';
import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SemanticKind } from '../semanticKind';

export class VectorInitialiserExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly elements: ExpressionSemanticNode[];

    public override readonly type: ConcreteType;

    constructor (elements: ExpressionSemanticNode[], type: ConcreteType)
    {
        super(SemanticKind.VectorInitialiserExpression, type);

        this.type = type;
        this.elements = elements;
    }
}
