import * as GenericNode from '../../connector/genericNodes';
import * as SemanticSymbols from '../..//connector/semanticSymbols';

export class Assignment extends GenericNode.Assignment<Expression, FieldExpression, VariableExpression> {}
export class BinaryExpression extends GenericNode.BinaryExpression<Expression> {}
export class CallExpression extends GenericNode.CallExpression<Expression> {}
export class FieldExpression extends GenericNode.FieldExpression<Expression> {}
export class File extends GenericNode.File<SemanticSymbols.Variable, SemanticSymbols.Field, FunctionDeclaration> {}
export class FunctionDeclaration extends GenericNode.FunctionDeclaration<Section> {}
export class LiteralExpression extends GenericNode.LiteralExpression {}
export class LocalVariableDeclaration extends GenericNode.LocalVariableDeclaration<Expression> {}
export class ReturnStatement extends GenericNode.ReturnStatement<Expression> {}
export class Section extends GenericNode.Section<Statement> {}
export class UnaryExpression extends GenericNode.UnaryExpression<Expression> {}
export class VariableExpression extends GenericNode.VariableExpression {}

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
