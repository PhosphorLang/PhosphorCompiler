import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';

export class FileSyntaxNode
{
    public readonly kind: SyntaxKind.File;
    public readonly token: null; // TODO: The "End of file" token could be used here.
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly fileName: string;
    public readonly module: SyntaxNodes.Module;
    public readonly imports: SyntaxNodes.Import[];
    public readonly variables: SyntaxNodes.GlobalVariableDeclaration[];
    public readonly fields: SyntaxNodes.FieldVariableDeclaration[];
    public readonly functions: SyntaxNodes.FunctionDeclaration[];

    constructor (
        name: string,
        module: SyntaxNodes.Module,
        imports: SyntaxNodes.Import[],
        variables: SyntaxNodes.GlobalVariableDeclaration[],
        fields: SyntaxNodes.FieldVariableDeclaration[],
        functions: SyntaxNodes.FunctionDeclaration[]
    ){
        this.kind = SyntaxKind.File;

        this.fileName = name;
        this.module = module;
        this.imports = imports;
        this.variables = variables;
        this.fields = fields;
        this.functions = functions;

        this.token = null;
        this.children = this.functions;
    }
}
