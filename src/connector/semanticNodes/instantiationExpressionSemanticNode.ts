import { ConcreteType } from '../semanticSymbols';
import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SemanticKind } from '../semanticKind';

export class InstantiationExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly arguments: ExpressionSemanticNode[];

    constructor (type: ConcreteType, constructorArguments: ExpressionSemanticNode[])
    {
        super(SemanticKind.InitialisationExpression, type);

        this.arguments = constructorArguments;
    }
}
