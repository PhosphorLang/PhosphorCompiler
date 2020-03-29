import TokenKind from "../lexer/tokenKind";
import TypeSemanticSymbol from "../connector/semanticSymbols/typeSemanticSymbol";

export default abstract class BuildInTypes
{
    public static readonly noType = new TypeSemanticSymbol('NoType');
    public static readonly int = new TypeSemanticSymbol('Int');
    public static readonly string = new TypeSemanticSymbol('String');

    public static getTypeByName (name: string): TypeSemanticSymbol|null
    {
        switch (name)
        {
            case 'Int':
                return this.int;
            case 'String':
                return this.string;
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
            default:
                return null;
        }
    }
}
