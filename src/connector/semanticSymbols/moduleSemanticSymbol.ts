import { FunctionSemanticSymbol } from './functionSemanticSymbol';
import { GenericTypeSemanticSymbol } from './genericTypeSemanticSymbol';
import { SemanticSymbol } from './semanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class ModuleSemanticSymbol extends SemanticSymbol
{
    /** The name of the module including the path. */
    public readonly pathName: string;
    /** The full name of the module including the path and prefix. */
    public readonly qualifiedName: string;

    public readonly classType: GenericTypeSemanticSymbol|null;

    public readonly functionsNameToSymbol: Map<string, FunctionSemanticSymbol>;

    public readonly isEntryPoint: boolean;

    constructor (
        name: string,
        pathName: string,
        qualifiedName: string,
        classType: GenericTypeSemanticSymbol|null,
        functionsNameToSymbol: Map<string, FunctionSemanticSymbol>,
        isEntryPoint: boolean,
    ) {
        super(SemanticSymbolKind.Module, name);

        this.pathName = pathName;
        this.qualifiedName = qualifiedName;
        this.classType = classType;
        this.functionsNameToSymbol = functionsNameToSymbol;
        this.isEntryPoint = isEntryPoint;
    }

    public equals (type: ModuleSemanticSymbol): boolean
    {
        return this.qualifiedName === type.qualifiedName;
    }
}
