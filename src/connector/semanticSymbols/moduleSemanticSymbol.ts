import { FunctionSemanticSymbol } from './functionSemanticSymbol';
import { GenericTypeSemanticSymbol } from './genericTypeSemanticSymbol';
import { SemanticSymbol } from './semanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';
import { VariableSemanticSymbol } from './variableSemanticSymbol';

export class ModuleSemanticSymbol extends SemanticSymbol
{
    /** The name of the module including the path. */
    public readonly pathName: string;
    /** The full name of the module including the path and prefix. */
    public readonly qualifiedName: string;

    public readonly classType: GenericTypeSemanticSymbol|null;

    public readonly variableNameToSymbol: Map<string, VariableSemanticSymbol>;
    public readonly functionNameToSymbol: Map<string, FunctionSemanticSymbol>;

    public readonly isEntryPoint: boolean;

    constructor (
        name: string,
        pathName: string,
        qualifiedName: string,
        classType: GenericTypeSemanticSymbol|null,
        variableNameToSymbol: Map<string, VariableSemanticSymbol>,
        functionNameToSymbol: Map<string, FunctionSemanticSymbol>,
        isEntryPoint: boolean,
    ) {
        super(SemanticSymbolKind.Module, name);

        this.pathName = pathName;
        this.qualifiedName = qualifiedName;
        this.classType = classType;
        this.variableNameToSymbol = variableNameToSymbol;
        this.functionNameToSymbol = functionNameToSymbol;
        this.isEntryPoint = isEntryPoint;
    }

    public equals (type: ModuleSemanticSymbol): boolean
    {
        return this.qualifiedName === type.qualifiedName;
    }
}
