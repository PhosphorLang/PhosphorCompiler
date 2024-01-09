import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class GlobalVariableDeclarationSyntaxNode
{
    public readonly kind: SyntaxKind.GlobalVariableDeclaration;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly keyword: Token;
    public readonly isConstant: boolean;
    public readonly identifier: Token;
    public readonly type: SyntaxNodes.TypeClause|null;
    public readonly assignment: Token|null;
    public readonly initialiser: SyntaxNodes.Expression|null;

    constructor (
        keyword: Token,
        isConstant: boolean,
        identifier: Token,
        type: SyntaxNodes.TypeClause|null,
        assignment: Token|null,
        initialiser: SyntaxNodes.Expression|null
    ) {
        this.kind = SyntaxKind.GlobalVariableDeclaration;

        this.keyword = keyword;
        this.isConstant = isConstant;
        this.identifier = identifier;
        this.type = type;
        this.assignment = assignment;
        this.initialiser = initialiser;

        this.token = this.keyword;

        if (this.initialiser === null)
        {
            this.children = [];
        }
        else
        {
            this.children = [this.initialiser];
        }
    }
}
