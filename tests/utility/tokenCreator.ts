import LexicalType from "../../src/lexer/lexicalType";
import Operator from "../../src/definitions/operator";
import Token from "../../src/lexer/token";

export default class TokenCreator
{
    public static newFile (): Token
    {
        return new Token(LexicalType.File, 'testFile');
    }

    public static newFunctionCall (): Token
    {
        return new Token(LexicalType.Id, 'print');
    }

    public static newNumber (): Token
    {
        return new Token(LexicalType.Number, '24');
    }

    public static newString (): Token
    {
        return new Token(LexicalType.String, 'Test string');
    }

    public static newUnknownOperator (): Token
    {
        return new Token(LexicalType.Operator, '§');
    }

    public static newOpeningBracket (): Token
    {
        return new Token(LexicalType.Operator, Operator.openingBracket);
    }

    public static newClosingBracket (): Token
    {
        return new Token(LexicalType.Operator, Operator.closingBracket);
    }

    public static newSemicolon (): Token
    {
        return new Token(LexicalType.Operator, Operator.semicolon);
    }

    public static newPlus (): Token
    {
        return new Token(LexicalType.Operator, Operator.plus);
    }
}
