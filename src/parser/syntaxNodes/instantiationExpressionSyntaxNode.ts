import { ElementsList } from '../elementsList';
import { ExpressionSyntaxNode } from './expressionSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';
import { TypeSyntaxNode } from './typeSyntaxNode';

export class InstantiationExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly keyword: Token;
    public readonly type: TypeSyntaxNode;
    public readonly opening: Token;
    public readonly arguments: ElementsList<ExpressionSyntaxNode>;
    public readonly closing: Token;

    public get children (): Iterable<SyntaxNode>
    {
        return this.arguments.elements;
    }

    public get token (): Token
    {
        return this.keyword;
    }

    constructor (
        keyword: Token,
        type: TypeSyntaxNode,
        opening: Token,
        constructorArguments: ElementsList<ExpressionSyntaxNode>,
        closing: Token
    ) {
        super(SyntaxKind.InstantiationExpression);

        this.keyword = keyword;
        this.type = type;
        this.opening = opening;
        this.arguments = constructorArguments;
        this.closing = closing;
    }
}
