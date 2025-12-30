import * as GenericNodes from '../../connector/genericNodes';
import * as SpecialisedSymbols from '../specialisedSymbols';

export class Assignment extends GenericNodes.Assignment<Expression, FieldExpression, VariableExpression> {}
export class BinaryExpression extends GenericNodes.BinaryExpression<Expression> {}
export class CallExpression extends GenericNodes.CallExpression<Expression, SpecialisedSymbols.ConcreteType> {}
export class ElseClause extends GenericNodes.ElseClause<Section, IfStatement> {}
export class FieldDeclaration extends GenericNodes.FieldDeclaration<Expression, SpecialisedSymbols.ConcreteType> {}
export class FieldExpression extends GenericNodes.FieldExpression<Expression, SpecialisedSymbols.ConcreteType> {}
export class File extends GenericNodes.File<
    GlobalVariableDeclaration,
    FieldDeclaration,
    FunctionDeclaration,
    SpecialisedSymbols.ConcreteType,
    SpecialisedSymbols.ConcreteType
> {}
export class FunctionDeclaration extends GenericNodes.FunctionDeclaration<Section, SpecialisedSymbols.ConcreteType> {}
export class GlobalVariableDeclaration extends GenericNodes.GlobalVariableDeclaration<Expression, SpecialisedSymbols.ConcreteType> {}
export class IfStatement extends GenericNodes.IfStatement<Expression, Section, ElseClause> {}
export class InstantiationExpression extends GenericNodes.InstantiationExpression<Expression, SpecialisedSymbols.ConcreteType> {}
export class LiteralExpression extends GenericNodes.LiteralExpression<SpecialisedSymbols.ConcreteType> {}
export class LocalVariableDeclaration extends GenericNodes.LocalVariableDeclaration<Expression, SpecialisedSymbols.ConcreteType> {}
export class ModuleExpression extends GenericNodes.ModuleExpression<SpecialisedSymbols.ConcreteType, SpecialisedSymbols.ConcreteType> {}
export class ReturnStatement extends GenericNodes.ReturnStatement<Expression> {}
export class Section extends GenericNodes.Section<Statement> {}
export class UnaryExpression extends GenericNodes.UnaryExpression<Expression> {}
export class VariableExpression extends GenericNodes.VariableExpression<SpecialisedSymbols.ConcreteType> {}
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
    Assignment
    | CallExpression
    | IfStatement
    | LocalVariableDeclaration
    | ReturnStatement
    | Section
    | WhileStatement;

export type Expression =
    BinaryExpression
    | CallExpression
    | FieldExpression
    | InstantiationExpression
    | LiteralExpression
    | ModuleExpression
    | UnaryExpression
    | VariableExpression;
