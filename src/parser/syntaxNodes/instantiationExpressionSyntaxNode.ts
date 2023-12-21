import { ElementsList } from '../elementsList';
import { ExpressionSyntaxNode } from './expressionSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';
import { TypeSyntaxNode } from './typeSyntaxNode';

export class InstantiationExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly type: TypeSyntaxNode;
    public readonly opening: Token;
    public readonly arguments: ElementsList<ExpressionSyntaxNode>;
    public readonly closing: Token;
    /** If true, the instantiation has an initialiser, if false, it's a constructor call.  */
    public readonly hasInitialiser: boolean;

    public get children (): Iterable<SyntaxNode>
    {
        return this.arguments.elements;
    }

    public get token (): Token
    {
        return this.type.identifier;
    }

    constructor (
        type: TypeSyntaxNode,
        opening: Token,
        constructorOrInitialiserArguments: ElementsList<ExpressionSyntaxNode>,
        closing: Token,
        hasInitialiser: boolean
    ) {
        super(SyntaxKind.InstantiationExpression);

        this.type = type;
        this.opening = opening;
        this.arguments = constructorOrInitialiserArguments;
        this.closing = closing;
        this.hasInitialiser = hasInitialiser;
    }
}
