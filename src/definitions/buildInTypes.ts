import * as SemanticSymbols from '../connector/semanticSymbols';
import { TokenKind } from '../lexer/tokenKind';

export abstract class BuildInTypes
{
    public static readonly noType = new SemanticSymbols.ConcreteType('NoType', []);
    public static readonly int = new SemanticSymbols.ConcreteType('Int', []);
    public static readonly bool = new SemanticSymbols.ConcreteType('Bool', []);
    public static readonly string = new SemanticSymbols.ConcreteType('String', []);
    public static readonly vector = new SemanticSymbols.GenericType(
        'Vector',
        [
            new SemanticSymbols.GenericParameter('Type', false),
            new SemanticSymbols.GenericParameter('Size', true), // TODO: What would the capitalisation convention be here?
        ]
    );

    public static getTypeByName (name: string): SemanticSymbols.Type|null
    {
        switch (name)
        {
            case 'Int':
                return this.int;
            case 'String':
                return this.string;
            case 'Bool':
                return this.bool;
            case 'Vector':
                return this.vector;
            default:
                return null;
        }
    }

    public static getTypeByTokenKind (tokenKind: TokenKind): SemanticSymbols.ConcreteType|null
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
