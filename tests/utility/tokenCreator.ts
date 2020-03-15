import Defaults from "./defaults";
import Operator from "../../src/definitions/operator";
import Token from "../../src/lexer/token";
import TokenType from "../../src/lexer/tokenType";

export default class TokenCreator
{
    public static newFile (name = Defaults.fileName): Token
    {
        return new Token(TokenType.File, name);
    }

    public static newIdentifier (identifier = Defaults.identifier, line = 0, column = 0): Token
    {
        return new Token(TokenType.IdentifierToken, identifier, line, column);
    }

    public static newVariableIdentifier (identifier = Defaults.variableName): Token
    {
        return new Token(TokenType.IdentifierToken, identifier);
    }

    public static newInteger (value = Defaults.number): Token
    {
        return new Token(TokenType.IntegerToken, value);
    }

    public static newString (value = Defaults.string): Token
    {
        return new Token(TokenType.StringToken, value);
    }

    public static newOpeningBracket (): Token
    {
        return new Token(TokenType.OpeningBracketToken, Operator.openingBracket);
    }

    public static newClosingBracket (): Token
    {
        return new Token(TokenType.ClosingBracketToken, Operator.closingBracket);
    }

    public static newSemicolon (): Token
    {
        return new Token(TokenType.SemicolonToken, Operator.semicolon);
    }

    public static newPlus (): Token
    {
        return new Token(TokenType.PlusOperator, Operator.plus);
    }

    public static newVar (): Token
    {
        return new Token(TokenType.VarKeyword, Operator.var);
    }

    public static newAssignment (): Token
    {
        return new Token(TokenType.AssignmentOperator, Operator.assignment);
    }
}
