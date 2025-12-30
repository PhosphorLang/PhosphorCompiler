import * as GenericSymbols from '.';
import { GenericSymbolBase } from './genericSymbolBase';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class FunctionGenericSymbol<TypeLike> extends GenericSymbolBase
{
    public readonly kind: SemanticSymbolKind.Function;

    public readonly returnType: TypeLike;
    public readonly parameters: GenericSymbols.FunctionParameter<TypeLike>[];
    public readonly thisReference: GenericSymbols.FunctionParameter<TypeLike>|null;
    public readonly isHeader: boolean;

    constructor (
        namespace: Namespace,
        returnType: TypeLike,
        parameters: GenericSymbols.FunctionParameter<TypeLike>[],
        thisReference: GenericSymbols.FunctionParameter<TypeLike>|null,
        isHeader: boolean
    ) {
        super(namespace);

        this.kind = SemanticSymbolKind.Function;

        this.returnType = returnType;
        this.parameters = parameters;
        this.thisReference = thisReference;
        this.isHeader = isHeader;
    }
}
