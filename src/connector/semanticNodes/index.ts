export { SemanticNode } from './semanticNode';

export { AssignmentSemanticNode as Assignment } from './assignmentSemanticNode';
export { BinaryExpressionSemanticNode as BinaryExpression } from './binaryExpressionSemanticNode';
export { CallExpressionSemanticNode as CallExpression } from './callExpressionSemanticNode';
export { ConditionalGotoStatementSemanticNode as ConditionalGotoStatement } from './conditionalGotoStatementSemanticNode';
export { ElseClauseSemanticNode as ElseClause } from './elseClauseSemanticNode';
export { ExpressionSemanticNode as Expression } from './expressionSemanticNode';
export { FileSemanticNode as File } from './fileSemanticNode';
export { FunctionDeclarationSemanticNode as FunctionDeclaration } from './functionDeclarationSemanticNode';
export { GlobalVariableDeclarationSemanticNode as GlobalVariableDeclaration } from './globalVariableDeclarationSemanticNode';
export { GotoStatementSemanticNode as GotoStatement } from './gotoStatementSemanticNode';
export { IfStatementSemanticNode as IfStatement } from './ifStatementSemanticNode';
export { InstantiationExpressionSemanticNode as InstantiationExpression } from './instantiationExpressionSemanticNode';
export { LabelSemanticNode as Label } from './labelSemanticNode';
export { LiteralExpressionSemanticNode as LiteralExpression } from './literalExpressionSemanticNode';
export { ReturnStatementSemanticNode as ReturnStatement } from './returnStatementSemanticNode';
export { SectionSemanticNode as Section } from './sectionSemanticNode';
export { UnaryExpressionSemanticNode as UnaryExpression } from './unaryExpressionSemanticNode';
export { LocalVariableDeclarationSemanticNode as LocalVariableDeclaration } from './localVariableDeclarationSemanticNode';
export { VariableExpressionSemanticNode as VariableExpression } from './variableExpressionSemanticNode';
export { WhileStatementSemanticNode as WhileStatement } from './whileStatementSemanticNode';

// TODO: The semantic nodes should, like the intermediates, have type unions to seperate them instead of the ineffective base clases.
