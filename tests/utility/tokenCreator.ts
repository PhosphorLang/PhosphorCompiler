import Defaults from "./defaults";
import Token from "../../src/lexer/token";
import TokenKind from '../../src/lexer/tokenKind';

export default class TokenCreator
{
    public static newIdentifier (identifier = Defaults.identifier, line = 0, column = 0): Token
    {
        return new Token(TokenKind.IdentifierToken, identifier, line, column);
    }

    public static newVariableIdentifier (identifier = Defaults.variableName): Token
    {
        return new Token(TokenKind.IdentifierToken, identifier);
    }

    public static newInteger (value = Defaults.number): Token
    {
        return new Token(TokenKind.IntegerToken, value);
    }

    public static newString (value = Defaults.string): Token
    {
        return new Token(TokenKind.StringToken, value);
    }

    public static newOpeningParenthesis (): Token
    {
        return new Token(TokenKind.OpeningParenthesisToken, '(');
    }

    public static newClosingParenthesis (): Token
    {
        return new Token(TokenKind.ClosingParenthesisToken, ')');
    }

    public static newOpeningBrace (): Token
    {
        return new Token(TokenKind.OpeningBraceToken, '{');
    }

    public static newClosingBrace (): Token
    {
        return new Token(TokenKind.ClosingBraceToken, '}');
    }

    public static newColon (): Token
    {
        return new Token(TokenKind.SemicolonToken, ':');
    }

    public static newSemicolon (): Token
    {
        return new Token(TokenKind.SemicolonToken, ';');
    }

    public static newComma (): Token
    {
        return new Token(TokenKind.CommaToken, ',');
    }

    public static newAssignment (): Token
    {
        return new Token(TokenKind.AssignmentOperator, ':=');
    }

    public static newPlus (): Token
    {
        return new Token(TokenKind.PlusOperator, '+');
    }

    public static newMinus (): Token
    {
        return new Token(TokenKind.MinusOperator, '-');
    }

    public static newStar (): Token
    {
        return new Token(TokenKind.StarOperator, '*');
    }

    public static newSlash (): Token
    {
        return new Token(TokenKind.SlashOperator, '/');
    }

    public static newVarKeyword (): Token
    {
        return new Token(TokenKind.VarKeyword, 'var');
    }

    public static newFunctionKeyword (): Token
    {
        return new Token(TokenKind.FunctionKeyword, 'function');
    }

    public static newReturnKeyword (): Token
    {
        return new Token(TokenKind.ReturnKeyword, 'return');
    }
}
