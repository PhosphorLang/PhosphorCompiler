import * as SemanticSymbols from '.';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolBase } from './SemanticSymbolBase';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class FunctionSemanticSymbol extends SemanticSymbolBase
{
    public readonly kind: SemanticSymbolKind.Function;

    public readonly parameters: SemanticSymbols.FunctionParameter[];
    public readonly returnType: SemanticSymbols.ConcreteType;
    public readonly isMethod: boolean;
    public readonly isHeader: boolean;

    constructor (
        namespace: Namespace,
        returnType: SemanticSymbols.ConcreteType,
        parameters: SemanticSymbols.FunctionParameter[],
        isMethod: boolean,
        isHeader: boolean
    ) {
        super(namespace);

        this.kind = SemanticSymbolKind.Function;

        this.returnType = returnType;
        this.parameters = parameters;
        this.isMethod = isMethod;
        this.isHeader = isHeader;
    }
}
