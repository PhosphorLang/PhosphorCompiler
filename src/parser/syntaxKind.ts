export enum SyntaxKind
{
    File = 'File',
    Section = 'Section',
    Namespace = 'Namespace',
    Module = 'Module',
    Import = 'Import',
    FunctionDeclaration = 'FunctionDeclaration',
    FunctionParameter = 'FunctionParameter',
    TypeClause = 'TypeClause',
    ElseClause = 'ElseClause',
    // Statements
    Assignment = 'Assignment',
    VariableDeclaration = 'VariableDeclaration',
    ReturnStatement = 'ReturnStatement',
    IfStatement = 'IfStatement',
    WhileStatement = 'WhileStatement',
    // Expressions
    AccessExpression = 'AccessExpression',
    UnaryExpression = 'UnaryExpression',
    BinaryExpression = 'BinaryExpression',
    BracketedExpression = 'BracketedExpression',
    LiteralExpression = 'LiteralExpression',
    VectorLiteralExpression = 'VectorLiteralExpression',
    VariableExpression = 'VariableExpression',
    CallExpression = 'CallExpression',
}
