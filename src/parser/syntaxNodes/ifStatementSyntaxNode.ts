import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class IfStatementSyntaxNode
{
    public readonly kind: SyntaxKind.IfStatement;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly keyword: Token;
    public readonly condition: SyntaxNodes.Expression;
    public readonly section: SyntaxNodes.Section;
    public readonly elseClause: SyntaxNodes.ElseClause|null;

    constructor (keyword: Token, condition: SyntaxNodes.Expression, section: SyntaxNodes.Section, elseClause: SyntaxNodes.ElseClause|null)
    {
        this.kind = SyntaxKind.IfStatement;

        this.keyword = keyword;
        this.condition = condition;
        this.section = section;
        this.elseClause = elseClause;

        this.token = this.keyword;
        this.children = [this.section];
    }
}
