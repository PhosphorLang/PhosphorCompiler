import * as SyntaxNodes from '.';
import { ElementsList } from '../elementsList';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class GenericsDeclarationSyntaxNode
{
    public readonly kind: SyntaxKind.GenericsDeclaration;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly keyword: Token;
    public readonly parameters: ElementsList<SyntaxNodes.GenericParameter>;

    constructor (keyword: Token, parameters: ElementsList<SyntaxNodes.GenericParameter>)
    {
        this.kind = SyntaxKind.GenericsDeclaration;

        this.keyword = keyword;
        this.parameters = parameters;

        this.token = this.keyword;
        this.children = parameters.elements;
    }
}
