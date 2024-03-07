import * as SyntaxNodes from '.';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class FieldVariableDeclarationSyntaxNode
{
    // TODO: LocalVariable, GlobalVariable and FieldVariable share a lot of code. Could they get a common base class?

    public readonly kind: SyntaxKind.FieldVariableDeclaration;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly keyword: Token;
    public readonly variableModifier: Token|null;
    public readonly identifier: Token;
    public readonly type: SyntaxNodes.TypeClause|null;
    public readonly assignment: Token|null;
    public readonly initialiser: SyntaxNodes.Expression|null;

    constructor (
        keyword: Token,
        variableModifier: Token|null,
        identifier: Token,
        type: SyntaxNodes.TypeClause|null,
        assignment: Token|null,
        initialiser: SyntaxNodes.Expression|null
    ) {
        this.kind = SyntaxKind.FieldVariableDeclaration;

        this.keyword = keyword;
        this.variableModifier = variableModifier;
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
