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
    UnaryExpression = 'UnaryExpression',
    BinaryExpression = 'BinaryExpression',
    ParenthesizedExpression = 'ParenthesizedExpression',
    LiteralExpression = 'LiteralExpression',
    VariableExpression = 'VariableExpression',
    CallExpression = 'CallExpression',
}

export default SyntaxKind;
