import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class ReturnStatementSyntaxNode
{
    public readonly kind: SyntaxKind.ReturnStatement;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly keyword: Token;
    public readonly expression: SyntaxNodes.Expression|null;

    constructor (keyword: Token, expression: SyntaxNodes.Expression|null)
    {
        this.kind = SyntaxKind.ReturnStatement;

        this.keyword = keyword;
        this.expression = expression;

        this.token = this.keyword;

        if (this.expression === null)
        {
            this.children = [];
        }
        else
        {
            this.children = [this.expression];
        }
    }
}
