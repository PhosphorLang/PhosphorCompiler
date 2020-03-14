import Defaults from "./defaults";
import LexicalType from "../../src/lexer/lexicalType";
import Operator from "../../src/definitions/operator";
import Token from "../../src/lexer/token";

export default class TokenCreator
{
    public static newFile (fileName = Defaults.fileName): Token
    {
        return new Token(LexicalType.File, fileName);
    }

    public static newIdentifier (identifier = Defaults.identifier, line = 0, column = 0): Token
    {
        return new Token(LexicalType.Id, identifier, line, column);
    }

    public static newVariableIdentifier (identifier = Defaults.variableName): Token
    {
        return new Token(LexicalType.Id, identifier);
    }

    public static newNumber (value = Defaults.number): Token
    {
        return new Token(LexicalType.Number, value);
    }

    public static newString (value = Defaults.string): Token
    {
        return new Token(LexicalType.String, value);
    }

    public static newUnknownOperator (operator = Defaults.unknown): Token
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
