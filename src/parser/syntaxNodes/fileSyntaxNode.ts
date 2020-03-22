import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";

export default class FileSyntaxNode extends SyntaxNode
{
    constructor ()
    {
        super(SyntaxType.File);
    }
}
