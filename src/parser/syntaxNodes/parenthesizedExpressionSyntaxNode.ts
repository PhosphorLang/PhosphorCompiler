import { ExpressionSyntaxNode } from './expressionSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';

export class ParenthesizedExpressionSyntaxNode extends ExpressionSyntaxNode // TODO: Rename to ParenthesisedExpressionSyntaxNode
{
    public readonly openingToken: Token;
    public readonly expression: ExpressionSyntaxNode;
    public readonly closingToken: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return [this.expression];
    }

    public get token (): Token
    {
        return this.openingToken;
    }

    constructor (openingToken: Token, expression: ExpressionSyntaxNode, closingToken: Token)
    {
        super(SyntaxKind.ParenthesizedExpression);

        this.openingToken = openingToken;
        this.expression = expression;
        this.closingToken = closingToken;
    }
}
