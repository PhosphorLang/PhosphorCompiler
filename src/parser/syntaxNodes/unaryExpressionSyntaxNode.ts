import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class UnaryExpressionSyntaxNode
{
    public readonly kind: SyntaxKind.UnaryExpression;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly operator: Token;
    public readonly operand: SyntaxNodes.Expression;

    constructor (operator: Token, operand: SyntaxNodes.Expression)
    {
        this.kind = SyntaxKind.UnaryExpression;

        this.operator = operator;
        this.operand = operand;

        this.token = this.operator;
        this.children = [this.operand];
    }
}
