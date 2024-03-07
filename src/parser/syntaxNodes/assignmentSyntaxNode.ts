import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class AssignmentSyntaxNode
{
    public readonly kind: SyntaxKind.Assignment;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly identifier: Token;
    public readonly operator: Token;
    public readonly expression: SyntaxNodes.Expression;

    constructor (identifier: Token, operator: Token, expression: SyntaxNodes.Expression)
    {
        this.kind = SyntaxKind.Assignment;

        this.identifier = identifier;
        this.operator = operator;
        this.expression = expression;

        this.token = this.operator;
        this.children = [this.expression];
    }
}
