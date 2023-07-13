import { ExpressionSyntaxNode } from "./expressionSyntaxNode";
import { SyntaxKind } from "../syntaxKind";
import { SyntaxNode } from "./syntaxNode";
import { Token } from "../../lexer/token";
import { ElementsList } from "../lists/elementsList";

export class VectorLiteralExpressionSyntaxNode extends ExpressionSyntaxNode
{
    public readonly opening: Token;
    public readonly closing: Token;
    public readonly elements: ElementsList;

    public get children (): Iterable<SyntaxNode>
    {
        return this.elements.elements;
    }

    public get token (): Token
    {
        return this.opening;
    }

    constructor (opening: Token, elements: ElementsList, closing: Token)
    {
        super(SyntaxKind.VectorLiteralExpression);

        this.opening = opening;
        this.elements = elements;
        this.closing = closing;
    }
}
