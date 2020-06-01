enum TokenKind
{
    NoToken,
    // Tokens
    IdentifierToken,
    IntegerToken,
    StringToken,
    OpeningParenthesisToken,
    ClosingParenthesisToken,
    OpeningBraceToken,
    ClosingBraceToken,
    ColonToken,
    SemicolonToken,
    CommaToken,
    // Operators
    AssignmentOperator,
    PlusOperator,
    MinusOperator,
    StarOperator,
    SlashOperator,
    EqualOperator,
    // Keywords
    VarKeyword,
    FunctionKeyword,
    ReturnKeyword,
    IfKeyword,
    ElseKeyword,
    WhileKeyword,
    TrueKeyword,
    FalseKeyword,
}

export default TokenKind;
