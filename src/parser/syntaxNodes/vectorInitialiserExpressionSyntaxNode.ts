import { ElementsList } from '../elementsList';
import { ExpressionSyntaxNode } from "./expressionSyntaxNode";
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';
import { TypeSyntaxNode } from './typeSyntaxNode';

export class VectorInitialiserExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly type: TypeSyntaxNode;
    public readonly opening: Token;
    public readonly closing: Token;
    public readonly elements: ElementsList<ExpressionSyntaxNode>; // TODO: The double "elements" (like inside the list) name is confusing.

    public get children (): Iterable<SyntaxNode>
    {
        return this.elements.elements;
    }

    public get token (): Token
    {
        return this.opening;
    }

    constructor (type: TypeSyntaxNode, opening: Token, elements: ElementsList<ExpressionSyntaxNode>, closing: Token)
    {
        super(SyntaxKind.VectorInitialiserExpression);

        this.type = type;
        this.opening = opening;
        this.elements = elements;
        this.closing = closing;
    }
}
