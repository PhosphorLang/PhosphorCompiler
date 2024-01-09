export enum SemanticKind
{
    ElseClause = 'ElseClause',
    File = 'File',
    Function = 'Function',
    Label = 'Label',
    Section = 'Section',
    Import = 'Import',
    // Statements
    Assignment = 'Assignment',
    ConditionalGotoStatement = 'ConditionalGotoStatement',
    GotoStatement = 'GotoStatement',
    IfStatement = 'IfStatement',
    WhileStatement = 'WhileStatement',
    ReturnStatement = 'ReturnStatement',
    LocalVariableDeclaration = 'LocalVariableDeclaration',
    GlobalVariableDeclaration = 'GlobalVariableDeclaration',
    FieldDeclaration = 'FieldDeclaration',
    // Expressions
    LiteralExpression = 'LiteralExpression',
    InstantiationExpression = 'InstantiationExpression',
    VariableExpression = 'VariableExpression',
    CallExpression = 'CallExpression',
    UnaryExpression = 'UnaryExpression',
    BinaryExpression = 'BinaryExpression',
    // TODO: Sort groups alphabetically.
}
