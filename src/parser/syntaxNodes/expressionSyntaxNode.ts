import { SyntaxNode } from './syntaxNode';
import { Token } from '../../lexer/token';

export abstract class ExpressionSyntaxNode extends SyntaxNode
{
    // @ts-expect-error Workaround to enable static typing for this class.
    private staticTyping = true;

    public abstract get token (): Token;
}
