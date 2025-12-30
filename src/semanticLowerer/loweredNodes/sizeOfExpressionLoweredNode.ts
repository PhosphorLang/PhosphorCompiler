import * as SpecialisedSymbols from '../../specialiser/specialisedSymbols';
import { BuildInTypes } from '../../definitions/buildInTypes';
import { SemanticKind } from '../../connector/semanticKind';

export class SizeOfExpressionLoweredNode
{
    public readonly kind: SemanticKind.SizeOfExpression;

    public readonly type: SpecialisedSymbols.ConcreteType;

    public readonly parameter: SpecialisedSymbols.ConcreteType;

    constructor (parameter: SpecialisedSymbols.ConcreteType)
    {
        this.kind = SemanticKind.SizeOfExpression;

        this.type = BuildInTypes.integer; // FIXME: This should be Cardinal.

        this.parameter = parameter;
    }
}
