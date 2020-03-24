import SyntaxNode from "./syntaxNodes/syntaxNode";
import Token from "../lexer/token";

export default class CallArgumentsList
{
    public readonly expressions: SyntaxNode[];
    public readonly separators: Token[];

    constructor (expressions: SyntaxNode[], separators: Token[])
    {
        this.expressions = expressions;
        this.separators = separators;
    }
}
