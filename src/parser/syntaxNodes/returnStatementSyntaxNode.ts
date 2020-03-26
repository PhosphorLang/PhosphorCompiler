import ExpressionSyntaxNode from "./expressionSyntaxNode";
import SyntaxNode from "./syntaxNode";
import SyntaxType from "../syntaxType";
import Token from "../../lexer/token";

export default class ReturnStatementSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly expression: ExpressionSyntaxNode|null;

    public get children (): Iterable<SyntaxNode>
    {
        if (this.expression === null)
        {
            return [];
        }
        else
        {
            return [this.expression];
        }
    }

    constructor (keyword: Token, expression: ExpressionSyntaxNode|null)
    {
        super(SyntaxType.ReturnStatement);

        this.keyword = keyword;
        this.expression = expression;
    }
}
