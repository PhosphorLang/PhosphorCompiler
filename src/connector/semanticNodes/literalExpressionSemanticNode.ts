import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class LiteralExpressionSemanticNode
{
    public readonly kind: SemanticKind.LiteralExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly value: string;

    constructor (value: string, type: SemanticSymbols.ConcreteType)
    {
        this.kind = SemanticKind.LiteralExpression;

        this.type = type;

        this.value = value;
    }
}
