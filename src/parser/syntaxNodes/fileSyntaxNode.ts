import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";

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
        super(SyntaxType.File);

        this.fileName = fileName;
        this.nodes = nodes;
    }
}
