import * as SemanticSymbols from '../../connector/semanticSymbols';
import { BuildInTypes } from '../../definitions/buildInTypes';
import { SemanticKind } from '../../connector/semanticKind';

export class SizeOfExpressionLoweredNode
{
    public readonly kind: SemanticKind.SizeOfExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly parameter: SemanticSymbols.ConcreteType;

    constructor (parameter: SemanticSymbols.ConcreteType)
    {
        this.kind = SemanticKind.SizeOfExpression;

        this.type = BuildInTypes.integer; // FIXME: Must be UInt.

        this.parameter = parameter;
    }
}
