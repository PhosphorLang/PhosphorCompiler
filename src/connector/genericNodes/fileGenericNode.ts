import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class FileGenericNode <GlobalVariableDeclaration, FieldDeclaration, FunctionDeclaration>
{
    public readonly kind: SemanticKind.File;

    public readonly name: string;
    public readonly module: SemanticSymbols.Module;
    public readonly imports: SemanticSymbols.Module[];
    public readonly variables: GlobalVariableDeclaration[];
    public readonly fields: FieldDeclaration[];
    public readonly functions: FunctionDeclaration[];

    constructor (
        name: string,
        module: SemanticSymbols.Module,
        imports: SemanticSymbols.Module[],
        variables: GlobalVariableDeclaration[],
        fields: FieldDeclaration[],
        functions: FunctionDeclaration[]
    ) {
        this.kind = SemanticKind.File;

        this.name = name;
        this.module = module;
        this.imports = imports;
        this.variables = variables;
        this.fields = fields;
        this.functions = functions;
    }
}
