import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class InstantiationExpressionGenericNode <Expression>
{
    public readonly kind: SemanticKind.InstantiationExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly arguments: Expression[];

    constructor (type: SemanticSymbols.ConcreteType, constructorArguments: Expression[])
    {
        this.kind = SemanticKind.InstantiationExpression;

        this.type = type;

        this.arguments = constructorArguments;
    }
}
