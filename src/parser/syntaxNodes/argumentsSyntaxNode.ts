import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class ArgumentsSyntaxNode extends SyntaxNode
{
    public readonly expressions: SyntaxNode[];
    public readonly separators: Token[];

    constructor (expressions: SyntaxNode[], separators: Token[])
    {
        super(SyntaxType.Arguments);

        this.expressions = expressions;
        this.separators = separators;

        this.children.push(...expressions);
    }
}
