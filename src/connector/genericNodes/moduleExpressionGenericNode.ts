import * as SemanticSymbols from '../semanticSymbols';
import { BuildInTypes } from '../../definitions/buildInTypes';
import { SemanticKind } from '../semanticKind';

export class ModuleExpressionGenericNode
{
    public readonly kind: SemanticKind.ModuleExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly module: SemanticSymbols.Module;

    constructor (module: SemanticSymbols.Module)
    {
        this.kind = SemanticKind.ModuleExpression;

        // TODO: Should there be a type for modules "moduleType" to make it more explicit?
        this.type = BuildInTypes.noType;

        this.module = module;
    }
}
