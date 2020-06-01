enum SemanticKind {
    ElseClause = 'ElseClause',
    File = 'File',
    Function = 'Function',
    Label = 'Label',
    Section = 'Section',
    // Statements
    Assignment = 'Assignment',
    ConditionalGotoStatement = 'ConditionalGotoStatement',
    GotoStatement = 'GotoStatement',
    IfStatement = 'IfStatement',
    WhileStatement = 'WhileStatement',
    ReturnStatement = 'ReturnStatement',
    VariableDeclaration = 'VariableDeclaration',
    // Expressions
    LiteralExpression = 'LiteralExpression',
    VariableExpression = 'VariableExpression',
    CallExpression = 'CallExpression',
    UnaryExpression = 'UnaryExpression',
    BinaryExpression = 'BinaryExpression',
    // TODO: Sort groups alphabetically.
}

export default SemanticKind;
