import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";
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
        super(SyntaxKind.FunctionParameter);

        this.identifier = identifier;
    }
}
