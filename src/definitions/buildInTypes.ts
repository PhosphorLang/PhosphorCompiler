import { TokenKind } from '../lexer/tokenKind';
import { TypeSemanticSymbol } from '../connector/semanticSymbols/typeSemanticSymbol';

export abstract class BuildInTypes
{
    public static readonly noType = new TypeSemanticSymbol('NoType');
    public static readonly int = new TypeSemanticSymbol('Int');
    public static readonly bool = new TypeSemanticSymbol('Bool');
    public static readonly string = new TypeSemanticSymbol('String');

    public static getTypeByName (name: string): TypeSemanticSymbol|null
    {
        switch (name)
        {
            case 'Int':
                return this.int;
            case 'String':
                return this.string;
            case 'Bool':
                return this.bool;
            default:
                return null;
        }
    }

    public static getTypeByTokenKind (tokenKind: TokenKind): TypeSemanticSymbol|null
    {
        switch (tokenKind)
        {
            case TokenKind.IntegerToken:
                return this.int;
            case TokenKind.StringToken:
                return this.string;
            case TokenKind.TrueKeyword:
            case TokenKind.FalseKeyword:
                return this.bool;
            default:
                return null;
        }
    }
}
