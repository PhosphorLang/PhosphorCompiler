enum SemanticKind {
    File = 'File',
    Function = 'Function',
    Section = 'Section',
    // Statements
    Assignment = 'Assignment',
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
