import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";

export default class FileSyntaxNode extends SyntaxNode
{
    public readonly fileName: string;
    public readonly nodes: SyntaxNode[];

    public get children (): Iterable<SyntaxNode>
    {
        return this.nodes;
    }

    constructor (fileName: string, nodes: SyntaxNode[])
    {
        super(SyntaxKind.File);

        this.fileName = fileName;
        this.nodes = nodes;
    }
}
