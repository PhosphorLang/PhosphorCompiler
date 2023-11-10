import { ElementsList } from '../elementsList';
import { ExpressionSyntaxNode } from "./expressionSyntaxNode";
import { SyntaxKind } from "../syntaxKind";
import { SyntaxNode } from "./syntaxNode";
import { Token } from "../../lexer/token";

export class VectorLiteralExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly opening: Token;
    public readonly closing: Token;
    public readonly elements: ElementsList<ExpressionSyntaxNode>;

    public get children (): Iterable<SyntaxNode>
    {
        return this.elements.elements;
    }

    public get token (): Token
    {
        return this.opening;
    }

    constructor (opening: Token, elements: ElementsList<ExpressionSyntaxNode>, closing: Token)
    {
        super(SyntaxKind.VectorLiteralExpression);

        this.opening = opening;
        this.elements = elements;
        this.closing = closing;
    }
}
