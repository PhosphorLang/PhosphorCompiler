import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class FunctionParameterSyntaxNode extends SyntaxNode
{
    public readonly identifier: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return [];
    }

    constructor (identifier: Token)
    {
        super(SyntaxType.FunctionParameter);

        this.identifier = identifier;
    }
}
