import * as SemanticSymbols from '../connector/semanticSymbols';
import { Namespace } from '../parser/namespace';
import { TokenKind } from '../lexer/tokenKind';

export abstract class BuildInTypes
{
    public static readonly noType = new SemanticSymbols.ConcreteType(Namespace.constructFromStrings('Phosphor', 'NoType'), []);
    // TODO: Integers are often misused for Cardinals. Should be corrected:
    public static readonly integer = new SemanticSymbols.ConcreteType(Namespace.constructFromStrings('Phosphor', 'Integer'), []);
    public static readonly boolean = new SemanticSymbols.ConcreteType(Namespace.constructFromStrings('Phosphor', 'Boolean'), []);
    public static readonly string = new SemanticSymbols.ConcreteType(Namespace.constructFromStrings('Phosphor', 'String'), []);
    public static readonly pointer = new SemanticSymbols.ConcreteType(Namespace.constructFromStrings('Phosphor', 'Pointer'), []);

    public static getTypeByName (name: string): SemanticSymbols.Type|null
    {
        switch (name)
        {
            case this.integer.namespace.baseName:
                return this.integer;
            case this.string.namespace.baseName:
                return this.string;
            case this.boolean.namespace.baseName:
                return this.boolean;
            case this.pointer.namespace.baseName:
                return this.pointer;
            default:
                return null;
        }
    }

    public static getTypeByTokenKind (tokenKind: TokenKind): SemanticSymbols.ConcreteType|null
    {
        switch (tokenKind)
        {
            case TokenKind.IntegerToken:
                return this.integer;
            case TokenKind.StringToken:
                return this.string;
            case TokenKind.TrueKeyword:
            case TokenKind.FalseKeyword:
                return this.boolean;
            default:
                return null;
        }
    }
}
