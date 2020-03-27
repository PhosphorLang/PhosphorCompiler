enum SyntaxKind
{
    NoKind = 'NoKind',
    File = 'File',
    Section = 'Section',
    FunctionDeclaration = 'FunctionDeclaration',
    FunctionParameter = 'FunctionParameter',
    TypeClause = 'TypeClause',
    // Statements
    Assignment = 'Assignment',
    VariableDeclaration = 'VariableDeclaration',
    ReturnStatement = 'ReturnStatement',
    // Expressions
    PrimaryExpression = 'PrimaryExpression',
    UnaryExpression = 'UnaryExpression',
    BinaryExpression = 'BinaryExpression',
    ParenthesizedExpression = 'ParenthesizedExpression',
    LiteralExpression = 'LiteralExpression',
    NameExpression = 'NameExpression',
    CallExpression = 'CallExpression',
}

export default SyntaxKind;
