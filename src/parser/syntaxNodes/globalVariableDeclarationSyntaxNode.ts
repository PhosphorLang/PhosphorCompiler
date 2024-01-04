import { ExpressionSyntaxNode } from './expressionSyntaxNode';
import { LocalVariableDeclarationSyntaxNode } from './localVariableDeclarationSyntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';
import { TypeClauseSyntaxNode } from './typeClauseSyntaxNode';

export class GlobalVariableDeclarationSyntaxNode extends LocalVariableDeclarationSyntaxNode
{
    /* TODO: It is unclean to have global variables be a child class of local variables only because they share code.
             There is no "is-a" relationship, is it? This must be refactored, maybe into both sharing a new parent class. */

    // @ts-expect-error Workaround to enable static typing for this class.
    private staticTyping = true;

    public readonly isConstant: boolean;

    constructor (
        keyword: Token,
        isConstant: boolean,
        identifier: Token,
        type: TypeClauseSyntaxNode|null,
        assignment: Token|null,
        initialiser: ExpressionSyntaxNode|null
    ) {
        super(keyword, identifier, type, assignment, initialiser);

        this.isConstant = isConstant;

        // The readonly property "kind" must be set in this child constructor but not setable somewhere else, so we cannot use a protected
        // setter or something similiar. And sadly the readonly modifier makes it read only in child constructors, too.
        // @ts-expect-error Reason: See above.
        this.kind = SyntaxKind.GlobalVariableDeclaration;
    }
}
