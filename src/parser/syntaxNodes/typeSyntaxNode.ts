import * as SyntaxNodes from '.';
import { ElementsList } from '../elementsList';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class TypeSyntaxNode
{
    public readonly kind: SyntaxKind.Type;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly identifier: Token;
    public readonly opening: Token|null;
    public readonly arguments: ElementsList<SyntaxNodes.TypeArgument>;
    public readonly closing: Token|null;

    constructor (identifier: Token, opening?: Token, typeArguments?: ElementsList<SyntaxNodes.TypeArgument>, closing?: Token)
    {
        this.kind = SyntaxKind.Type;

        this.identifier = identifier;
        this.opening = opening ?? null;
        this.arguments = typeArguments ?? new ElementsList([], []);
        this.closing = closing ?? null;

        this.token = this.identifier;
        this.children = this.arguments.elements;
    }
}
