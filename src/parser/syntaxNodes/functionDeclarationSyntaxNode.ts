import { ElementsList } from '../elementsList';
import { FunctionParameterSyntaxNode } from './functionParameterSyntaxNode';
import { SectionSyntaxNode } from './sectionSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';
import { TypeClauseSyntaxNode } from './typeClauseSyntaxNode';

export class FunctionDeclarationSyntaxNode extends SyntaxNode
{
    public readonly keyword: Token;
    public readonly identifier: Token;
    public readonly opening: Token;
    public readonly parameters: ElementsList<FunctionParameterSyntaxNode>;
    public readonly closing: Token;
    public readonly type: TypeClauseSyntaxNode|null;
    public readonly body: SectionSyntaxNode|null;
    public readonly isMethod: boolean;
    public readonly isHeader: boolean;

    public get children (): Iterable<SyntaxNode>
    {
        return this.parameters.elements;
    }

    constructor (
        keyword: Token,
        identifier: Token,
        opening: Token,
        parameters: ElementsList<FunctionParameterSyntaxNode>,
        closing: Token,
        type: TypeClauseSyntaxNode|null,
        body: SectionSyntaxNode|null,
        isMethod: boolean,
        isHeader: boolean)
    {
        super(SyntaxKind.FunctionDeclaration);

        this.keyword = keyword;
        this.identifier = identifier;
        this.opening = opening;
        this.parameters = parameters;
        this.closing = closing;
        this.type = type;
        this.body = body;
        this.isMethod = isMethod;
        this.isHeader = isHeader;
    }
}
