export { AssignmentSemanticNode as Assignment } from './assignmentSemanticNode';
export { BinaryExpressionSemanticNode as BinaryExpression } from './binaryExpressionSemanticNode';
export { CallExpressionSemanticNode as CallExpression } from './callExpressionSemanticNode';
export { ElseClauseSemanticNode as ElseClause } from './elseClauseSemanticNode';
export { FileSemanticNode as File } from './fileSemanticNode';
export { FunctionDeclarationSemanticNode as FunctionDeclaration } from './functionDeclarationSemanticNode';
export { GlobalVariableDeclarationSemanticNode as GlobalVariableDeclaration } from './globalVariableDeclarationSemanticNode';
export { IfStatementSemanticNode as IfStatement } from './ifStatementSemanticNode';
export { InstantiationExpressionSemanticNode as InstantiationExpression } from './instantiationExpressionSemanticNode';
export { LiteralExpressionSemanticNode as LiteralExpression } from './literalExpressionSemanticNode';
export { LocalVariableDeclarationSemanticNode as LocalVariableDeclaration } from './localVariableDeclarationSemanticNode';
export { ReturnStatementSemanticNode as ReturnStatement } from './returnStatementSemanticNode';
export { SectionSemanticNode as Section } from './sectionSemanticNode';
export { UnaryExpressionSemanticNode as UnaryExpression } from './unaryExpressionSemanticNode';
export { VariableExpressionSemanticNode as VariableExpression } from './variableExpressionSemanticNode';
export { WhileStatementSemanticNode as WhileStatement } from './whileStatementSemanticNode';

import { AssignmentSemanticNode } from './assignmentSemanticNode';
import { BinaryExpressionSemanticNode } from './binaryExpressionSemanticNode';
import { CallExpressionSemanticNode } from './callExpressionSemanticNode';
import { ElseClauseSemanticNode } from './elseClauseSemanticNode';
import { FileSemanticNode } from './fileSemanticNode';
import { FunctionDeclarationSemanticNode } from './functionDeclarationSemanticNode';
import { GlobalVariableDeclarationSemanticNode } from './globalVariableDeclarationSemanticNode';
import { IfStatementSemanticNode } from './ifStatementSemanticNode';
import { InstantiationExpressionSemanticNode } from './instantiationExpressionSemanticNode';
import { LiteralExpressionSemanticNode } from './literalExpressionSemanticNode';
import { LocalVariableDeclarationSemanticNode } from './localVariableDeclarationSemanticNode';
import { ReturnStatementSemanticNode } from './returnStatementSemanticNode';
import { SectionSemanticNode } from './sectionSemanticNode';
import { UnaryExpressionSemanticNode } from './unaryExpressionSemanticNode';
import { VariableExpressionSemanticNode } from './variableExpressionSemanticNode';
import { WhileStatementSemanticNode } from './whileStatementSemanticNode';

export type SemanticNode =
    AssignmentSemanticNode | BinaryExpressionSemanticNode | CallExpressionSemanticNode | ElseClauseSemanticNode | FileSemanticNode
    | FunctionDeclarationSemanticNode | GlobalVariableDeclarationSemanticNode | IfStatementSemanticNode
    | InstantiationExpressionSemanticNode | LiteralExpressionSemanticNode | LocalVariableDeclarationSemanticNode
    | ReturnStatementSemanticNode | SectionSemanticNode | UnaryExpressionSemanticNode | VariableExpressionSemanticNode
    | WhileStatementSemanticNode;

export type Statement =
    AssignmentSemanticNode | CallExpressionSemanticNode | IfStatementSemanticNode | LocalVariableDeclarationSemanticNode
    | ReturnStatementSemanticNode | SectionSemanticNode | WhileStatementSemanticNode;

export type Expression =
    BinaryExpressionSemanticNode | CallExpressionSemanticNode | InstantiationExpressionSemanticNode | LiteralExpressionSemanticNode
    | UnaryExpressionSemanticNode | VariableExpressionSemanticNode;
