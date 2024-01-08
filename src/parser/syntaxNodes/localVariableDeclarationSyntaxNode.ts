import { ExpressionSyntaxNode } from './expressionSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';
import { TypeClauseSyntaxNode } from './typeClauseSyntaxNode';

export class LocalVariableDeclarationSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly variableModifier: Token|null;
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
        variableModifier: Token|null,
        identifier: Token,
        type: TypeClauseSyntaxNode|null,
        assignment: Token|null,
        initialiser: ExpressionSyntaxNode|null
    ) {
        super(SyntaxKind.LocalVariableDeclaration);

        this.keyword = keyword;
        this.variableModifier = variableModifier;
        this.identifier = identifier;
        this.type = type;
        this.assignment = assignment;
        this.initialiser = initialiser;
    }
}
