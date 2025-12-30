import * as GenericSymbols from '.';
import { GenericSymbolBase } from './genericSymbolBase';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class ModuleGenericSymbol<ClassType, TypeLike> extends GenericSymbolBase
{
    public readonly kind: SemanticSymbolKind.Module;

    public readonly classType: ClassType|null;

    public readonly variableNameToSymbol: Map<string, GenericSymbols.Variable<TypeLike>>;
    public readonly fieldNameToSymbol: Map<string, GenericSymbols.Field<TypeLike>>;
    public readonly functionNameToSymbol: Map<string, GenericSymbols.Function<TypeLike>>;

    public readonly isEntryPoint: boolean;

    constructor (
        namespace: Namespace,
        classType: ClassType|null,
        variableNameToSymbol: Map<string, GenericSymbols.Variable<TypeLike>>,
        fieldNameToSymbol: Map<string, GenericSymbols.Field<TypeLike>>,
        functionNameToSymbol: Map<string, GenericSymbols.Function<TypeLike>>,
        isEntryPoint: boolean,
    ) {
        super(namespace);

        this.kind = SemanticSymbolKind.Module;

        this.classType = classType;
        this.variableNameToSymbol = variableNameToSymbol;
        this.fieldNameToSymbol = fieldNameToSymbol;
        this.functionNameToSymbol = functionNameToSymbol;
        this.isEntryPoint = isEntryPoint;
    }
}
