// TODO: "GenericNode" is somewhat too broad. Finde a better way to describe its purpose regarding "SemanticNode" and "LoweredNode".

export { AssignmentGenericNode as Assignment } from './assignmentGenericNode';
export { BinaryExpressionGenericNode as BinaryExpression } from './binaryExpressionGenericNode';
export { CallExpressionGenericNode as CallExpression } from './callExpressionGenericNode';
export { ElseClauseGenericNode as ElseClause } from './elseClauseGenericNode';
export { FieldDeclarationGenericNode as FieldDeclaration } from './fieldDeclarationGenericNode';
export { FieldExpressionGenericNode as FieldExpression } from './fieldExpressionGenericNode';
export { FileGenericNode as File } from './fileGenericNode';
export { FunctionDeclarationGenericNode as FunctionDeclaration } from './functionDeclarationGenericNode';
export { GlobalVariableDeclarationGenericNode as GlobalVariableDeclaration } from './globalVariableDeclarationGenericNode';
export { IfStatementGenericNode as IfStatement } from './ifStatementGenericNode';
export { InstantiationExpressionGenericNode as InstantiationExpression } from './instantiationExpressionGenericNode';
export { LiteralExpressionGenericNode as LiteralExpression } from './literalExpressionGenericNode';
export { LocalVariableDeclarationGenericNode as LocalVariableDeclaration } from './localVariableDeclarationGenericNode';
export { ModuleExpressionGenericNode as ModuleExpression } from './moduleExpressionGenericNode';
export { ReturnStatementGenericNode as ReturnStatement } from './returnStatementGenericNode';
export { SectionGenericNode as Section } from './sectionGenericNode';
export { UnaryExpressionGenericNode as UnaryExpression } from './unaryExpressionGenericNode';
export { VariableExpressionGenericNode as VariableExpression } from './variableExpressionGenericNode';
export { WhileStatementGenericNode as WhileStatement } from './whileStatementGenericNode';

import { AssignmentGenericNode } from './assignmentGenericNode';
import { BinaryExpressionGenericNode } from './binaryExpressionGenericNode';
import { CallExpressionGenericNode } from './callExpressionGenericNode';
import { ElseClauseGenericNode } from './elseClauseGenericNode';
import { FieldDeclarationGenericNode } from './fieldDeclarationGenericNode';
import { FieldExpressionGenericNode } from './fieldExpressionGenericNode';
import { FileGenericNode } from './fileGenericNode';
import { FunctionDeclarationGenericNode } from './functionDeclarationGenericNode';
import { GlobalVariableDeclarationGenericNode } from './globalVariableDeclarationGenericNode';
import { IfStatementGenericNode } from './ifStatementGenericNode';
import { InstantiationExpressionGenericNode } from './instantiationExpressionGenericNode';
import { LiteralExpressionGenericNode } from './literalExpressionGenericNode';
import { LocalVariableDeclarationGenericNode } from './localVariableDeclarationGenericNode';
import { ModuleExpressionGenericNode } from './moduleExpressionGenericNode';
import { ReturnStatementGenericNode } from './returnStatementGenericNode';
import { SectionGenericNode } from './sectionGenericNode';
import { UnaryExpressionGenericNode } from './unaryExpressionGenericNode';
import { VariableExpressionGenericNode } from './variableExpressionGenericNode';
import { WhileStatementGenericNode } from './whileStatementGenericNode';

export type GenericNode<
    Expression,
    Statement,
    FunctionDeclaration,
    Section,
    GlobalVariableDeclaration,
    FieldDeclaration,
    VariableExpression,
    FieldExpression,
    IfStatement,
    ElseClause
> =
    AssignmentGenericNode<Expression, FieldExpression, VariableExpression>
    | BinaryExpressionGenericNode<Expression>
    | CallExpressionGenericNode<Expression>
    | ElseClauseGenericNode<Section, IfStatement>
    | FieldDeclarationGenericNode<Expression>
    | FieldExpressionGenericNode<Expression>
    | FileGenericNode<GlobalVariableDeclaration, FieldDeclaration, FunctionDeclaration>
    | FunctionDeclarationGenericNode<Section>
    | GlobalVariableDeclarationGenericNode<Expression>
    | IfStatementGenericNode<Expression, Section, ElseClause>
    | InstantiationExpressionGenericNode<Expression>
    | LiteralExpressionGenericNode
    | LocalVariableDeclarationGenericNode<Expression>
    | ModuleExpressionGenericNode
    | ReturnStatementGenericNode<Expression>
    | SectionGenericNode<Statement>
    | UnaryExpressionGenericNode<Expression>
    | VariableExpressionGenericNode
    | WhileStatementGenericNode<Expression, Section>;

export type GenericStatement<Expression, Statement, Section, ElseClause, VariableExpression, FieldExpression> =
    AssignmentGenericNode<Expression, FieldExpression, VariableExpression>
    | CallExpressionGenericNode<Expression>
    | IfStatementGenericNode<Expression, Section, ElseClause>
    | LocalVariableDeclarationGenericNode<Expression>
    | ReturnStatementGenericNode<Expression>
    | SectionGenericNode<Statement>
    | WhileStatementGenericNode<Expression, Section>;

export type GenericExpression<Expression> =
    BinaryExpressionGenericNode<Expression>
    | CallExpressionGenericNode<Expression>
    | FieldExpressionGenericNode<Expression>
    | InstantiationExpressionGenericNode<Expression>
    | LiteralExpressionGenericNode
    | ModuleExpressionGenericNode
    | UnaryExpressionGenericNode<Expression>
    | VariableExpressionGenericNode;
