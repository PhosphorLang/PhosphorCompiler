import FunctionDeclarationSyntaxNode from './functionDeclarationSyntaxNode';
import ImportSyntaxNode from './importSyntaxNode';
import SyntaxKind from '../syntaxKind';
import SyntaxNode from './syntaxNode';

export default class FileSyntaxNode extends SyntaxNode
{
    public readonly name: string;
    public readonly imports: ImportSyntaxNode[];
    public readonly functions: FunctionDeclarationSyntaxNode[];

    public get children (): Iterable<SyntaxNode>
    {
        return this.functions;
    }

    constructor (name: string, imports: ImportSyntaxNode[], functions: FunctionDeclarationSyntaxNode[])
    {
        super(SyntaxKind.File);

        this.name = name;
        this.imports = imports;
        this.functions = functions;
    }
}
