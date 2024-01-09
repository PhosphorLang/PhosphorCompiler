export { AccessExpressionSyntaxNode as AccessExpression } from './accessExpressionSyntaxNode';
export { AssignmentSyntaxNode as Assignment } from './assignmentSyntaxNode';
export { BinaryExpressionSyntaxNode as BinaryExpression } from './binaryExpressionSyntaxNode';
export { BracketedExpressionSyntaxNode as BracketedExpression } from './bracketedExpressionSyntaxNode';
export { CallExpressionSyntaxNode as CallExpression } from './callExpressionSyntaxNode';
export { ElseClauseSyntaxNode as ElseClause } from './elseClauseSyntaxNode';
export { FileSyntaxNode as File } from './fileSyntaxNode';
export { FunctionDeclarationSyntaxNode as FunctionDeclaration } from './functionDeclarationSyntaxNode';
export { FunctionParameterSyntaxNode as FunctionParameter } from './functionParameterSyntaxNode';
export { GlobalVariableDeclarationSyntaxNode as GlobalVariableDeclaration } from './globalVariableDeclarationSyntaxNode';
export { IfStatementSyntaxNode as IfStatement } from './ifStatementSyntaxNode';
export { ImportSyntaxNode as Import } from './importSyntaxNode';
export { InstantiationExpressionSyntaxNode as InstantiationExpression } from './instantiationExpressionSyntaxNode';
export { LiteralExpressionSyntaxNode as LiteralExpression } from './literalExpressionSyntaxNode';
export { LocalVariableDeclarationSyntaxNode as LocalVariableDeclaration } from './localVariableDeclarationSyntaxNode';
export { ModuleSyntaxNode as Module } from './moduleSyntaxNode';
export { ReturnStatementSyntaxNode as ReturnStatement } from './returnStatementSyntaxNode';
export { SectionSyntaxNode as Section } from './sectionSyntaxNode';
export { TypeClauseSyntaxNode as TypeClause } from './typeClauseSyntaxNode';
export { TypeSyntaxNode as Type } from './typeSyntaxNode';
export { UnaryExpressionSyntaxNode as UnaryExpression } from './unaryExpressionSyntaxNode';
export { VariableExpressionSyntaxNode as VariableExpression } from './variableExpressionSyntaxNode';
export { WhileStatementSyntaxNode as WhileStatement } from './whileStatementSyntaxNode';

import { AccessExpressionSyntaxNode } from './accessExpressionSyntaxNode';
import { AssignmentSyntaxNode } from './assignmentSyntaxNode';
import { BinaryExpressionSyntaxNode } from './binaryExpressionSyntaxNode';
import { BracketedExpressionSyntaxNode } from './bracketedExpressionSyntaxNode';
import { CallExpressionSyntaxNode } from './callExpressionSyntaxNode';
import { ElseClauseSyntaxNode } from './elseClauseSyntaxNode';
import { FileSyntaxNode } from './fileSyntaxNode';
import { FunctionDeclarationSyntaxNode } from './functionDeclarationSyntaxNode';
import { FunctionParameterSyntaxNode } from './functionParameterSyntaxNode';
import { GlobalVariableDeclarationSyntaxNode } from './globalVariableDeclarationSyntaxNode';
import { IfStatementSyntaxNode } from './ifStatementSyntaxNode';
import { ImportSyntaxNode } from './importSyntaxNode';
import { InstantiationExpressionSyntaxNode } from './instantiationExpressionSyntaxNode';
import { LiteralExpressionSyntaxNode } from './literalExpressionSyntaxNode';
import { LocalVariableDeclarationSyntaxNode } from './localVariableDeclarationSyntaxNode';
import { ModuleSyntaxNode } from './moduleSyntaxNode';
import { ReturnStatementSyntaxNode } from './returnStatementSyntaxNode';
import { SectionSyntaxNode } from './sectionSyntaxNode';
import { TypeClauseSyntaxNode } from './typeClauseSyntaxNode';
import { TypeSyntaxNode } from './typeSyntaxNode';
import { UnaryExpressionSyntaxNode } from './unaryExpressionSyntaxNode';
import { VariableExpressionSyntaxNode } from './variableExpressionSyntaxNode';
import { WhileStatementSyntaxNode } from './whileStatementSyntaxNode';

export type SyntaxNode =
    AccessExpressionSyntaxNode | AssignmentSyntaxNode | BinaryExpressionSyntaxNode | BracketedExpressionSyntaxNode
    | CallExpressionSyntaxNode | ElseClauseSyntaxNode | FileSyntaxNode | FunctionDeclarationSyntaxNode | FunctionParameterSyntaxNode
    | GlobalVariableDeclarationSyntaxNode | IfStatementSyntaxNode | ImportSyntaxNode | InstantiationExpressionSyntaxNode
    | LiteralExpressionSyntaxNode | LocalVariableDeclarationSyntaxNode | ModuleSyntaxNode | ReturnStatementSyntaxNode
    | SectionSyntaxNode | TypeClauseSyntaxNode | TypeSyntaxNode | UnaryExpressionSyntaxNode | VariableExpressionSyntaxNode
    | WhileStatementSyntaxNode;

export type Statement =
    AccessExpressionSyntaxNode | AssignmentSyntaxNode | CallExpressionSyntaxNode | IfStatementSyntaxNode
    | LocalVariableDeclarationSyntaxNode | ReturnStatementSyntaxNode | SectionSyntaxNode | WhileStatementSyntaxNode;

export type Expression =
    AccessExpressionSyntaxNode | BinaryExpressionSyntaxNode | BracketedExpressionSyntaxNode | CallExpressionSyntaxNode
    | InstantiationExpressionSyntaxNode | LiteralExpressionSyntaxNode | UnaryExpressionSyntaxNode | VariableExpressionSyntaxNode;

export type PrimaryExpression =
    AccessExpressionSyntaxNode | BracketedExpressionSyntaxNode | CallExpressionSyntaxNode | InstantiationExpressionSyntaxNode
    | LiteralExpressionSyntaxNode | VariableExpressionSyntaxNode;

export type IdentifierExpression = AccessExpressionSyntaxNode | CallExpressionSyntaxNode | VariableExpressionSyntaxNode;

export type TypeArgument = TypeSyntaxNode | LiteralExpressionSyntaxNode;
