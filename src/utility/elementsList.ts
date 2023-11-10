import { SyntaxNode } from '../syntaxNodes';
import { Token } from '../../lexer/token';

export class ElementsList <TSyntaxNode extends SyntaxNode>
{
    public readonly elements: TSyntaxNode[];
    public readonly separators: Token[];

    constructor (elements: TSyntaxNode[], separators: Token[])
    {
        this.elements = elements;
        this.separators = separators;
    }
}
