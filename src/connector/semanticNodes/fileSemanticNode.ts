import * as SemanticNodes from '.';
import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class FileSemanticNode
{
    public readonly kind: SemanticKind.File;

    public readonly name: string;
    public readonly module: SemanticSymbols.Module;
    public readonly imports: SemanticSymbols.Module[];
    public readonly variables: SemanticNodes.GlobalVariableDeclaration[];
    public readonly functions: SemanticNodes.FunctionDeclaration[];

    constructor (
        name: string,
        module: SemanticSymbols.Module,
        imports: SemanticSymbols.Module[],
        variables: SemanticNodes.GlobalVariableDeclaration[],
        functions: SemanticNodes.FunctionDeclaration[]
    ) {
        this.kind = SemanticKind.File;

        this.name = name;
        this.module = module;
        this.imports = imports;
        this.variables = variables;
        this.functions = functions;
    }
}
