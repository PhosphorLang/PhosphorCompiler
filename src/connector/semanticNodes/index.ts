import * as GenericNode from '../genericNodes';

export class Assignment extends GenericNode.Assignment<Expression, FieldExpression, VariableExpression> {}
export class BinaryExpression extends GenericNode.BinaryExpression<Expression> {}
export class CallExpression extends GenericNode.CallExpression<Expression> {}
export class ElseClause extends GenericNode.ElseClause<Section, IfStatement> {}
export class FieldDeclaration extends GenericNode.FieldDeclaration<Expression> {}
export class FieldExpression extends GenericNode.FieldExpression<Expression> {}
export class File extends GenericNode.File<GlobalVariableDeclaration, FieldDeclaration, FunctionDeclaration> {}
export class FunctionDeclaration extends GenericNode.FunctionDeclaration<Section> {}
export class GlobalVariableDeclaration extends GenericNode.GlobalVariableDeclaration<Expression> {}
export class IfStatement extends GenericNode.IfStatement<Expression, Section, ElseClause> {}
export class InstantiationExpression extends GenericNode.InstantiationExpression<Expression> {}
export class LiteralExpression extends GenericNode.LiteralExpression {}
export class LocalVariableDeclaration extends GenericNode.LocalVariableDeclaration<Expression> {}
export class ModuleExpression extends GenericNode.ModuleExpression {}
export class ReturnStatement extends GenericNode.ReturnStatement<Expression> {}
export class Section extends GenericNode.Section<Statement> {}
export class UnaryExpression extends GenericNode.UnaryExpression<Expression> {}
export class VariableExpression extends GenericNode.VariableExpression {}
export class WhileStatement extends GenericNode.WhileStatement<Expression, Section> {}

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
