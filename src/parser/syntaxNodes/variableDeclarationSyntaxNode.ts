import AssignmentSyntaxNode from "./assignmentSyntaxNode";
import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";
import Token from "../../lexer/token";
import TypeClauseSyntaxNode from "./typeClauseSyntaxNode";

export default class VariableDeclarationSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly identifier: Token;
    public readonly type: TypeClauseSyntaxNode|null;
    public readonly assignment: AssignmentSyntaxNode|null;

    public get children (): Iterable<SyntaxNode>
    {
        if (this.assignment === null)
        {
            return [];
        }
        else
        {
            return [this.assignment];
        }
    }

    constructor (keyword: Token, identifier: Token, type: TypeClauseSyntaxNode|null, assignment: AssignmentSyntaxNode|null)
    {
        super(SyntaxKind.VariableDeclaration);

        this.keyword = keyword;
        this.identifier = identifier;
        this.type = type;
        this.assignment = assignment;
    }
}
