import * as SemanticSymbols from '../../connector/semanticSymbols';
import { LoweredSymbolKind } from '../loweredSymbolKind';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolBase } from '../../connector/semanticSymbols/SemanticSymbolBase';

export class FunctionLoweredSymbol extends SemanticSymbolBase
{
    public readonly kind: LoweredSymbolKind.Function;

    public readonly parameters: SemanticSymbols.FunctionParameter[];
    public readonly returnType: SemanticSymbols.ConcreteType;
    public readonly isHeader: boolean;

    constructor (
        namespace: Namespace,
        returnType: SemanticSymbols.ConcreteType,
        parameters: SemanticSymbols.FunctionParameter[],
        isHeader: boolean
    ) {
        super(namespace);

        this.kind = LoweredSymbolKind.Function;

        this.returnType = returnType;
        this.parameters = parameters;
        this.isHeader = isHeader;
    }
}
