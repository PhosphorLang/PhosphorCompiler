import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class SectionSyntaxNode extends SyntaxNode
{
    public readonly opening: Token;
    public readonly statements: SyntaxNode[];
    public readonly closing: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return this.statements;
    }

    constructor (opening: Token, statements: SyntaxNode[], closing: Token)
    {
        super(SyntaxType.Section);

        this.opening = opening;
        this.statements = statements;
        this.closing = closing;
    }
}
