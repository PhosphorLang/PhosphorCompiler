import * as GenericNodes from '../genericNodes';
import * as SemanticSymbols from '../semanticSymbols';

export class ArrayGetExpression extends GenericNodes.ArrayGetExpression<Expression, SemanticSymbols.TypeLike> {}
export class ArrayInstantiationExpression extends GenericNodes.ArrayInstantiationExpression<Expression, SemanticSymbols.TypeLike> {}
export class ArraySetExpression extends GenericNodes.ArraySetExpression<Expression, SemanticSymbols.TypeLike> {}
export class Assignment extends GenericNodes.Assignment<Expression, FieldExpression, VariableExpression> {}
export class BinaryExpression extends GenericNodes.BinaryExpression<Expression> {}
export class CallExpression extends GenericNodes.CallExpression<Expression, SemanticSymbols.TypeLike> {}
export class ElseClause extends GenericNodes.ElseClause<Section, IfStatement> {}
export class FieldDeclaration extends GenericNodes.FieldDeclaration<Expression, SemanticSymbols.TypeLike> {}
export class FieldExpression extends GenericNodes.FieldExpression<Expression, SemanticSymbols.TypeLike> {}
export class File extends GenericNodes.File<
    GlobalVariableDeclaration,
    FieldDeclaration,
    FunctionDeclaration,
    SemanticSymbols.GenericType,
    SemanticSymbols.TypeLike
> {}
export class FunctionDeclaration extends GenericNodes.FunctionDeclaration<Section, SemanticSymbols.TypeLike> {}
export class GlobalVariableDeclaration extends GenericNodes.GlobalVariableDeclaration<Expression, SemanticSymbols.TypeLike> {}
export class IfStatement extends GenericNodes.IfStatement<Expression, Section, ElseClause> {}
export class InstantiationExpression extends GenericNodes.InstantiationExpression<Expression, SemanticSymbols.TypeLike> {}
export class LiteralExpression extends GenericNodes.LiteralExpression<SemanticSymbols.TypeLike> {}
export class LocalVariableDeclaration extends GenericNodes.LocalVariableDeclaration<Expression, SemanticSymbols.TypeLike> {}
export class ModuleExpression extends GenericNodes.ModuleExpression<SemanticSymbols.GenericType, SemanticSymbols.TypeLike> {}
export class ReturnStatement extends GenericNodes.ReturnStatement<Expression> {}
export class Section extends GenericNodes.Section<Statement> {}
export class UnaryExpression extends GenericNodes.UnaryExpression<Expression> {}
export class VariableExpression extends GenericNodes.VariableExpression<SemanticSymbols.TypeLike> {}
export class WhileStatement extends GenericNodes.WhileStatement<Expression, Section> {}

export type SemanticNode =
    Assignment
    | BinaryExpression
    | CallExpression
    | ElseClause
    | FieldExpression
    | File
    | FunctionDeclaration
    | GlobalVariableDeclaration
    | FieldDeclaration
    | IfStatement
    | InstantiationExpression
    | LiteralExpression
    | LocalVariableDeclaration
    | ModuleExpression
    | ReturnStatement
    | Section
    | UnaryExpression
    | VariableExpression
    | WhileStatement;

export type Statement =
    ArraySetExpression
    | Assignment
    | CallExpression
    | IfStatement
    | LocalVariableDeclaration
    | ReturnStatement
    | Section
    | WhileStatement;

export type Expression =
    ArrayGetExpression
    | ArrayInstantiationExpression
    | ArraySetExpression // TODO: We should no have this here. It is needed because typing and usage mismatch, which is bad.
    | BinaryExpression
    | CallExpression
    | FieldExpression
    | InstantiationExpression
    | LiteralExpression
    | ModuleExpression
    | UnaryExpression
    | VariableExpression;
