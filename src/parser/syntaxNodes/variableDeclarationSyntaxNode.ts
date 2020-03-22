import AssignmentSyntaxNode from "./assignmentSyntaxNode";
import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class VariableDeclarationSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly identifier: Token;
    public readonly assignment: AssignmentSyntaxNode|null;

    constructor (keyword: Token, identifier: Token, assignment: AssignmentSyntaxNode|null)
    {
        super(SyntaxType.VariableDeclaration);

        this.keyword = keyword;
        this.identifier = identifier;
        this.assignment = assignment;

        if (assignment !== null)
        {
            this.children.push(assignment);
        }
    }
}
