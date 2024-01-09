import * as SyntaxNodes from '.';
import { ElementsList } from '../elementsList';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class InstantiationExpressionSyntaxNode
{
    public readonly kind: SyntaxKind.InstantiationExpression;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly keyword: Token;
    public readonly type: SyntaxNodes.Type;
    public readonly opening: Token;
    public readonly arguments: ElementsList<SyntaxNodes.Expression>;
    public readonly closing: Token;

    constructor (
        keyword: Token,
        type: SyntaxNodes.Type,
        opening: Token,
        constructorArguments: ElementsList<SyntaxNodes.Expression>,
        closing: Token
    ) {
        this.kind = SyntaxKind.InstantiationExpression;

        this.keyword = keyword;
        this.type = type;
        this.opening = opening;
        this.arguments = constructorArguments;
        this.closing = closing;

        this.token = this.keyword;
        this.children = this.arguments.elements;
    }
}
