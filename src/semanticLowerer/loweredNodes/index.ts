import * as GenericNode from '../../connector/genericNodes';

export class Assignment extends GenericNode.Assignment<Expression> {}
export class BinaryExpression extends GenericNode.BinaryExpression<Expression> {}
export class CallExpression extends GenericNode.CallExpression<Expression, VariableExpression> {}
export class File extends GenericNode.File<GlobalVariableDeclaration, FunctionDeclaration> {}
export class FunctionDeclaration extends GenericNode.FunctionDeclaration<Section> {}
export class GlobalVariableDeclaration extends GenericNode.GlobalVariableDeclaration<Expression> {}
export class LiteralExpression extends GenericNode.LiteralExpression {}
export class LocalVariableDeclaration extends GenericNode.LocalVariableDeclaration<Expression> {}
export class ReturnStatement extends GenericNode.ReturnStatement<Expression> {}
export class Section extends GenericNode.Section<Statement> {}
export class UnaryExpression extends GenericNode.UnaryExpression<Expression> {}
export class VariableExpression extends GenericNode.VariableExpression {}

export { ConditionalGotoStatementLoweredNode as ConditionalGotoStatement } from './conditionalGotoStatementLoweredNode';
export { GotoStatementLoweredNode as GotoStatement } from './gotoStatementLoweredNode';
export { LabelLoweredNode as Label } from './labelLoweredNode';

import { ConditionalGotoStatementLoweredNode } from './conditionalGotoStatementLoweredNode';
import { GotoStatementLoweredNode } from './gotoStatementLoweredNode';
import { LabelLoweredNode } from './labelLoweredNode';

export type LoweredNode =
    Assignment
    | BinaryExpression
    | CallExpression
    | File
    | FunctionDeclaration
    | GlobalVariableDeclaration
    | LiteralExpression
    | LocalVariableDeclaration
    | ReturnStatement
    | Section
    | UnaryExpression
    | VariableExpression
    | ConditionalGotoStatementLoweredNode
    | GotoStatementLoweredNode
    | LabelLoweredNode;

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
    | LiteralExpression
    | UnaryExpression
    | VariableExpression;
