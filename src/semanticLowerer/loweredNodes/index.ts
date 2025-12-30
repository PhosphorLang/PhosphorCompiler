import * as GenericNode from '../../connector/genericNodes';
import * as SpecialisedSymbols from '../../specialiser/specialisedSymbols';

export class Assignment extends GenericNode.Assignment<Expression, FieldExpression, VariableExpression> {}
export class BinaryExpression extends GenericNode.BinaryExpression<Expression> {}
export class CallExpression extends GenericNode.CallExpression<Expression, SpecialisedSymbols.ConcreteType> {}
export class FieldExpression extends GenericNode.FieldExpression<Expression, SpecialisedSymbols.ConcreteType> {}
export class File extends GenericNode.File<
    SpecialisedSymbols.Variable, // TODO: It should be explained why we use symbols here rather than nodes.
    SpecialisedSymbols.Field,
    FunctionDeclaration,
    SpecialisedSymbols.ConcreteType,
    SpecialisedSymbols.ConcreteType
> {}
export class FunctionDeclaration extends GenericNode.FunctionDeclaration<Section, SpecialisedSymbols.ConcreteType> {}
export class LiteralExpression extends GenericNode.LiteralExpression<SpecialisedSymbols.ConcreteType> {}
export class LocalVariableDeclaration extends GenericNode.LocalVariableDeclaration<Expression, SpecialisedSymbols.ConcreteType> {}
export class ReturnStatement extends GenericNode.ReturnStatement<Expression> {}
export class Section extends GenericNode.Section<Statement> {}
export class UnaryExpression extends GenericNode.UnaryExpression<Expression> {}
export class VariableExpression extends GenericNode.VariableExpression<SpecialisedSymbols.ConcreteType> {}

export { ConditionalGotoStatementLoweredNode as ConditionalGotoStatement } from './conditionalGotoStatementLoweredNode';
export { GotoStatementLoweredNode as GotoStatement } from './gotoStatementLoweredNode';
export { LabelLoweredNode as Label } from './labelLoweredNode';
export { SizeOfExpressionLoweredNode as SizeOfExpression } from './sizeOfExpressionLoweredNode';

import { ConditionalGotoStatementLoweredNode } from './conditionalGotoStatementLoweredNode';
import { GotoStatementLoweredNode } from './gotoStatementLoweredNode';
import { LabelLoweredNode } from './labelLoweredNode';
import { SizeOfExpressionLoweredNode } from './sizeOfExpressionLoweredNode';

export type LoweredNode =
    Assignment
    | BinaryExpression
    | CallExpression
    | File
    | FieldExpression
    | FunctionDeclaration
    | LiteralExpression
    | LocalVariableDeclaration
    | ReturnStatement
    | Section
    | UnaryExpression
    | VariableExpression
    | ConditionalGotoStatementLoweredNode
    | GotoStatementLoweredNode
    | LabelLoweredNode
    | SizeOfExpressionLoweredNode;

export type Statement =
    Assignment
    | CallExpression
    | LocalVariableDeclaration
    | ReturnStatement
    | Section
    | ConditionalGotoStatementLoweredNode
    | GotoStatementLoweredNode
    | LabelLoweredNode;

export type Expression =
    BinaryExpression
    | CallExpression
    | FieldExpression
    | LiteralExpression
    | UnaryExpression
    | VariableExpression
    | SizeOfExpressionLoweredNode;
