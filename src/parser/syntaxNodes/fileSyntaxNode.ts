import { FunctionDeclarationSyntaxNode } from './functionDeclarationSyntaxNode';
import { ImportSyntaxNode } from './importSyntaxNode';
import { ModuleSyntaxNode } from './moduleSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';

export class FileSyntaxNode extends SyntaxNode
{
    public readonly fileName: string;
    public readonly module: ModuleSyntaxNode;
    public readonly imports: ImportSyntaxNode[];
    public readonly functions: FunctionDeclarationSyntaxNode[];

    public get children (): Iterable<SyntaxNode>
    {
        return this.functions;
    }

    constructor (name: string, module: ModuleSyntaxNode, imports: ImportSyntaxNode[], functions: FunctionDeclarationSyntaxNode[])
    {
        super(SyntaxKind.File);

        this.fileName = name;
        this.module = module;
        this.imports = imports;
        this.functions = functions;
    }
}
