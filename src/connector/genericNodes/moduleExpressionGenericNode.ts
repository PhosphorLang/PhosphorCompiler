import * as GenericSymbols from '../genericSymbols';
import * as SpecialisedSymbols from '../../specialiser/specialisedSymbols';
import { BuildInTypes } from '../../definitions/buildInTypes';
import { SemanticKind } from '../semanticKind';

export class ModuleExpressionGenericNode<ClassTypeSymbol, TypeLikeSymbol>
{
    public readonly kind: SemanticKind.ModuleExpression;

    public readonly type: SpecialisedSymbols.ConcreteType;

    public readonly module: GenericSymbols.Module<ClassTypeSymbol, TypeLikeSymbol>;

    constructor (module: GenericSymbols.Module<ClassTypeSymbol, TypeLikeSymbol>)
    {
        this.kind = SemanticKind.ModuleExpression;

        // TODO: Should there be a type for modules "moduleType" to make it more explicit?
        this.type = BuildInTypes.noType;

        this.module = module;
    }
}
