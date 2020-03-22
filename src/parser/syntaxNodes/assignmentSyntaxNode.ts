import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class AssignmentSyntaxNode extends SyntaxNode
{
    public readonly identifier: Token;
    public readonly assignment: Token;
    public readonly rightSide: SyntaxNode;

    constructor (identifier: Token, assignment: Token, rightSide: SyntaxNode)
    {
        super(SyntaxType.Assignment);

        this.identifier = identifier;
        this.assignment = assignment;
        this.rightSide = rightSide;

        this.children.push(rightSide);
    }
}
