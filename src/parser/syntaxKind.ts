enum SyntaxKind
{
    NoKind = 'NoKind',
    File = 'File',
    Section = 'Section',
    FunctionDeclaration = 'FunctionDeclaration',
    FunctionParameter = 'FunctionParameter',
    TypeClause = 'TypeClause',
    ElseClause = 'ElseClause',
    // Statements
    Assignment = 'Assignment',
    VariableDeclaration = 'VariableDeclaration',
    ReturnStatement = 'ReturnStatement',
    IfStatement = 'IfStatement',
    // Expressions
    UnaryExpression = 'UnaryExpression',
    BinaryExpression = 'BinaryExpression',
    ParenthesizedExpression = 'ParenthesizedExpression',
    LiteralExpression = 'LiteralExpression',
    VariableExpression = 'VariableExpression',
    CallExpression = 'CallExpression',
}

export default SyntaxKind;
