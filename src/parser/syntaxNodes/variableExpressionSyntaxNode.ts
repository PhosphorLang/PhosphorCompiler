import { ExpressionSyntaxNode } from './expressionSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';

export class VariableExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly identifier: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return [];
    }

    public get token (): Token
    {
        return this.identifier;
    }

    constructor (identifier: Token)
    {
        super(SyntaxKind.VariableExpression);

        this.identifier = identifier;
    }
}
