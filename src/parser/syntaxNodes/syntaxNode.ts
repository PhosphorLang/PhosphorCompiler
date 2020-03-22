import SyntaxType from "../syntaxType";

export default abstract class SyntaxNode
{
    public readonly type: SyntaxType;
    public readonly children: SyntaxNode[];

    constructor (type: SyntaxType)
    {
        this.type = type;

        this.children = [];
    }
}
