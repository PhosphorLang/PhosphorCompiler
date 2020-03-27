import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxKind from "../syntaxKind";
import SyntaxNode from "./syntaxNode";
import Token from "../../lexer/token";

export default class AssignmentSyntaxNode extends SyntaxNode
{
    public readonly identifier: Token;
    public readonly operator: Token;
    public readonly expression: ExpressionSyntaxNode;

    public get children (): Iterable<SyntaxNode>
    {
        return [this.expression];
    }

    constructor (identifier: Token, operator: Token, expression: ExpressionSyntaxNode)
    {
        super(SyntaxKind.Assignment);

        this.identifier = identifier;
        this.operator = operator;
        this.expression = expression;
    }
}
