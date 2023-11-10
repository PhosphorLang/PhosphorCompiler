import { ArgumentsList } from '../lists/argumentsList';
import { ExpressionSyntaxNode } from './expressionSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';

export class CallExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly identifier: Token;
    public readonly opening: Token;
    public readonly arguments: ArgumentsList<ExpressionSyntaxNode>;
    public readonly closing: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return this.arguments.elements;
    }

    public get token (): Token
    {
        return this.identifier;
    }

    constructor (identifier: Token, opening: Token, callArguments: ArgumentsList<ExpressionSyntaxNode>, closing: Token)
    {
        super(SyntaxKind.CallExpression);

        this.identifier = identifier;
        this.opening = opening;
        this.arguments = callArguments;
        this.closing = closing;
    }
}
