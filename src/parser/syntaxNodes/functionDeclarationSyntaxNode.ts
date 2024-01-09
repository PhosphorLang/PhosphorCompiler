import * as SyntaxNodes from '.';
import { ElementsList } from '../elementsList';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class FunctionDeclarationSyntaxNode
{
    public readonly kind: SyntaxKind.FunctionDeclaration;
    public readonly token: Token;
    public readonly children: Iterable<SyntaxNodes.SyntaxNode>;

    public readonly keyword: Token;
    public readonly identifier: Token;
    public readonly opening: Token;
    public readonly parameters: ElementsList<SyntaxNodes.FunctionParameter>;
    public readonly closing: Token;
    public readonly type: SyntaxNodes.TypeClause|null;
    public readonly body: SyntaxNodes.Section|null;
    public readonly isMethod: boolean;
    public readonly isHeader: boolean;

    constructor (
        keyword: Token,
        identifier: Token,
        opening: Token,
        parameters: ElementsList<SyntaxNodes.FunctionParameter>,
        closing: Token,
        type: SyntaxNodes.TypeClause|null,
        body: SyntaxNodes.Section|null,
        isMethod: boolean,
        isHeader: boolean)
    {
        this.kind = SyntaxKind.FunctionDeclaration;

        this.keyword = keyword;
        this.identifier = identifier;
        this.opening = opening;
        this.parameters = parameters;
        this.closing = closing;
        this.type = type;
        this.body = body;
        this.isMethod = isMethod;
        this.isHeader = isHeader;

        this.token = this.keyword;
        this.children = this.parameters.elements;
    }
}
