import * as SemanticSymbols from '.';
import { Namespace } from '../../parser/namespace';
import { SemanticSymbolBase } from './SemanticSymbolBase';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class ModuleSemanticSymbol extends SemanticSymbolBase
{
    public readonly kind: SemanticSymbolKind.Module;

    public readonly classType: SemanticSymbols.GenericType|null;

    public readonly variableNameToSymbol: Map<string, SemanticSymbols.Variable>;
    public readonly fieldNameToSymbol: Map<string, SemanticSymbols.Field>;
    public readonly functionNameToSymbol: Map<string, SemanticSymbols.Function>;

    public readonly isEntryPoint: boolean;

    constructor (
        namespace: Namespace,
        classType: SemanticSymbols.GenericType|null,
        variableNameToSymbol: Map<string, SemanticSymbols.Variable>,
        fieldNameToSymbol: Map<string, SemanticSymbols.Field>,
        functionNameToSymbol: Map<string, SemanticSymbols.Function>,
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
