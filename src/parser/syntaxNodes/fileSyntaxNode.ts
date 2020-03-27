import FunctionDeclarationSyntaxNode from "./functionDeclarationSyntaxNode";
import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";

export default class FileSyntaxNode extends SyntaxNode
{
    public readonly fileName: string;
    public readonly functions: FunctionDeclarationSyntaxNode[];

    public get children (): Iterable<SyntaxNode>
    {
        return this.functions;
    }

    constructor (fileName: string, functions: FunctionDeclarationSyntaxNode[])
    {
        super(SyntaxKind.File);

        this.fileName = fileName;
        this.functions = functions;
    }
}
