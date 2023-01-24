import { ExpressionSyntaxNode } from "../syntaxNodes/expressionSyntaxNode";
import { Token } from "../../lexer/token";

// TODO: Is there a better name for this? It is used for lists of expressions in vectors/arrays etc.
export class ElementsList
{
    public readonly elements: ExpressionSyntaxNode[];
    public readonly separators: Token[];

    constructor (elements: ExpressionSyntaxNode[], separators: Token[])
    {
        this.elements = elements;
        this.separators = separators;
    }
}
