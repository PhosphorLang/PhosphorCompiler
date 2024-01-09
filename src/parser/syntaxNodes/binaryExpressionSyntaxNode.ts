import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class BinaryExpressionSyntaxNode
{
    public readonly kind: SyntaxKind.BinaryExpression;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly leftSide: SyntaxNodes.Expression;
    public readonly operator: Token;
    public readonly rightSide: SyntaxNodes.Expression;

    constructor (leftSide: SyntaxNodes.Expression, operator: Token, rightSide: SyntaxNodes.Expression)
    {
        this.kind = SyntaxKind.BinaryExpression;

        this.leftSide = leftSide;
        this.operator = operator;
        this.rightSide = rightSide;

        this.token = this.operator;
        this.children = [this.leftSide, this.rightSide];
    }
}
