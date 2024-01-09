import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class WhileStatementSyntaxNode
{
    public readonly kind: SyntaxKind.WhileStatement;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly keyword: Token;
    public readonly condition: SyntaxNodes.Expression;
    public readonly section: SyntaxNodes.Section;

    constructor (keyword: Token, condition: SyntaxNodes.Expression, section: SyntaxNodes.Section)
    {
        this.kind = SyntaxKind.WhileStatement;

        this.keyword = keyword;
        this.condition = condition;
        this.section = section;

        this.token = this.keyword;
        this.children = [this.section];
    }
}
