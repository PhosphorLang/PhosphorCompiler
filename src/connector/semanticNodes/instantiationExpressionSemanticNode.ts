import * as SemanticNodes from '.';
import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class InstantiationExpressionSemanticNode
{
    public readonly kind: SemanticKind.InitialisationExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly arguments: SemanticNodes.Expression[];

    constructor (type: SemanticSymbols.ConcreteType, constructorArguments: SemanticNodes.Expression[])
    {
        this.kind = SemanticKind.InitialisationExpression;

        this.type = type;

        this.arguments = constructorArguments;
    }
}
