enum SemanticKind {
    ElseClause = 'ElseClause',
    File = 'File',
    Function = 'Function',
    Section = 'Section',
    // Statements
    Assignment = 'Assignment',
    IfStatement = 'IfStatement',
    ReturnStatement = 'ReturnStatement',
    VariableDeclaration = 'VariableDeclaration',
    // Expressions
    LiteralExpression = 'LiteralExpression',
    VariableExpression = 'VariableExpression',
    CallExpression = 'CallExpression',
    UnaryExpression = 'UnaryExpression',
    BinaryExpression = 'BinaryExpression',
}

export default SemanticKind;
