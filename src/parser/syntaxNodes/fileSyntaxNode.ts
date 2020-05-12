import FunctionDeclarationSyntaxNode from "./functionDeclarationSyntaxNode";
import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";

export default class FileSyntaxNode extends SyntaxNode
{
    public readonly name: string;
    public readonly functions: FunctionDeclarationSyntaxNode[];

    public get children (): Iterable<SyntaxNode>
    {
        return this.functions;
    }

    constructor (name: string, functions: FunctionDeclarationSyntaxNode[])
    {
        super(SyntaxKind.File);

        this.name = name;
        this.functions = functions;
    }
}
