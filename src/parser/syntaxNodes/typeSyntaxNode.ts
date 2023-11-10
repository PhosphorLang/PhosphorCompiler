import { ElementsList } from '../elementsList';
import { LiteralExpressionSyntaxNode } from './literalExpressionSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';

type TypeArgumentsList = ElementsList<TypeSyntaxNode|LiteralExpressionSyntaxNode>;

export class TypeSyntaxNode extends SyntaxNode
{
    public readonly identifier: Token;
    public readonly opening: Token|null;
    public readonly arguments: TypeArgumentsList;
    public readonly closing: Token|null;

    public get children (): Iterable<SyntaxNode>
    {
        return this.arguments.elements;
    }

    constructor (identifier: Token, opening?: Token, typeArguments?: TypeArgumentsList, closing?: Token)
    {
        super(SyntaxKind.Type);

        this.identifier = identifier;
        this.opening = opening ?? null;
        this.arguments = typeArguments ?? new ElementsList([], []);
        this.closing = closing ?? null;
    }
}
