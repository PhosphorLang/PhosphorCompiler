import { ExpressionSyntaxNode } from './expressionSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';
import { TypeClauseSyntaxNode } from './typeClauseSyntaxNode';

export class GlobalVariableDeclarationSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly isConstant: boolean;
    public readonly identifier: Token;
    public readonly type: TypeClauseSyntaxNode|null;
    public readonly assignment: Token|null;
    public readonly initialiser: ExpressionSyntaxNode|null;

    public get children (): Iterable<SyntaxNode>
    {
        if (this.initialiser === null)
        {
            return [];
        }
        else
        {
            return [this.initialiser];
        }
    }

    constructor (
        keyword: Token,
        isConstant: boolean,
        identifier: Token,
        type: TypeClauseSyntaxNode|null,
        assignment: Token|null,
        initialiser: ExpressionSyntaxNode|null
    ) {
        super(SyntaxKind.GlobalVariableDeclaration);

        this.keyword = keyword;
        this.isConstant = isConstant;
        this.identifier = identifier;
        this.type = type;
        this.assignment = assignment;
        this.initialiser = initialiser;
    }
}
