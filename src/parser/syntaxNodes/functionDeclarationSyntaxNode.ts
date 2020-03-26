import FunctionParametersList from "../functionParametersList";
import SectionSyntaxNode from "./sectionSyntaxNode";
import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class FunctionDeclarationSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly identifier: Token;
    public readonly opening: Token;
    public readonly parameters: FunctionParametersList;
    public readonly closing: Token;
    public readonly body: SectionSyntaxNode;

    public get children (): Iterable<SyntaxNode>
    {
        return this.parameters.parameters;
    }

    constructor (keyword: Token, identifier: Token, opening: Token, parameters: FunctionParametersList, closing: Token, body: SectionSyntaxNode)
    {
        super(SyntaxType.FunctionDeclaration);

        this.keyword = keyword;
        this.identifier = identifier;
        this.opening = opening;
        this.parameters = parameters;
        this.closing = closing;
        this.body = body;
    }
}
