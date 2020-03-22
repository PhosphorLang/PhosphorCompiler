enum TokenType
{
    NoToken,
    // Tokens
    IdentifierToken,
    IntegerToken,
    StringToken,
    OpeningBracketToken,
    ClosingBracketToken,
    SemicolonToken,
    // Operators
    AssignmentOperator,
    PlusOperator,
    MinusOperator,
    StarOperator,
    SlashOperator,
    CommaOperator,
    // Keywords
    VarKeyword,
}

export default TokenType;
