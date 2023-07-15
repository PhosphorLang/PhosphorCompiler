import { CallExpressionSyntaxNode } from './callExpressionSyntaxNode';
import { ExpressionSyntaxNode } from './expressionSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';

export class AccessExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly identifier: Token;
    public readonly dot: Token;
    public readonly functionCall: CallExpressionSyntaxNode;

    public get children (): Iterable<SyntaxNode>
    {
        return [this.functionCall];
    }

    public get token (): Token
    {
        return this.identifier;
    }

    constructor (identifier: Token, dot: Token, functionCall: CallExpressionSyntaxNode)
    {
        super(SyntaxKind.AccessExpression);

        this.identifier = identifier;
        this.dot = dot;
        this.functionCall = functionCall;
    }
}
