enum SyntaxType
{
    NoType = 'NoType',
    File = 'File',
    Section = 'Section',
    FunctionDeclaration = 'FunctionDeclaration',
    FunctionParameter = 'FunctionParameter',
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

export default SyntaxType;
