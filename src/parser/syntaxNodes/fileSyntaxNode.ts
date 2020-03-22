import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";

export default class FileSyntaxNode extends SyntaxNode
{
    public readonly fileName: string;

    constructor (fileName: string)
    {
        super(SyntaxType.File);

        this.fileName = fileName;
    }
}
