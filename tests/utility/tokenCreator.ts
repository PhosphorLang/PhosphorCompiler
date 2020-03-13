import LexicalType from "../../src/lexer/lexicalType";
import Operator from "../../src/definitions/operator";
import Token from "../../src/lexer/token";

export default class TokenCreator
{
    public static newFile (fileName = 'testFile'): Token
    {
        return new Token(LexicalType.File, fileName);
    }

    public static newIdentificator (identificator = 'print', line = 0, column = 0): Token
    {
        return new Token(LexicalType.Id, identificator, line, column);
    }

    public static newNumber (value = '24'): Token
    {
        return new Token(LexicalType.Number, value);
    }

    public static newString (value = 'Test string'): Token
    {
        return new Token(LexicalType.String, value);
    }

    public static newUnknownOperator (operator = '§'): Token
    {
        return new Token(LexicalType.Operator, operator);
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

    public static newVar (): Token
    {
        return new Token(LexicalType.Operator, Operator.var);
    }

    public static newAssignment (): Token
    {
        return new Token(LexicalType.Operator, Operator.assignment);
    }
}
