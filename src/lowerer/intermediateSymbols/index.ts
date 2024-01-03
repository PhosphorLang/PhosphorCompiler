export { ConstantIntermediateSymbol as Constant } from './constantIntermediateSymbol';
export { FunctionIntermediateSymbol as Function } from './functionIntermediateSymbol';
export { GlobalVariableIntermediateSymbol as Global } from './globalVariableIntermediateSymbol';
export { LabelIntermediateSymbol as Label } from './labelIntermediateSymbol';
export { LiteralIntermediateSymbol as Literal } from './literalIntermediateSymbol';
export { LocalVariableIntermediateSymbol as LocalVariable } from './localVariableIntermediateSymbol';
export { ParameterIntermediateSymbol as Parameter } from './parameterIntermediateSymbol';
export { ReturnValueIntermediateSymbol as ReturnValue } from './returnValueIntermediateSymbol';

import { ConstantIntermediateSymbol } from './constantIntermediateSymbol';
import { FunctionIntermediateSymbol } from './functionIntermediateSymbol';
import { GlobalVariableIntermediateSymbol } from './globalVariableIntermediateSymbol';
import { LabelIntermediateSymbol } from './labelIntermediateSymbol';
import { LiteralIntermediateSymbol } from './literalIntermediateSymbol';
import { LocalVariableIntermediateSymbol } from './localVariableIntermediateSymbol';
import { ParameterIntermediateSymbol } from './parameterIntermediateSymbol';
import { ReturnValueIntermediateSymbol } from './returnValueIntermediateSymbol';

export type IntermediateSymbol = ConstantIntermediateSymbol | FunctionIntermediateSymbol | GlobalVariableIntermediateSymbol
    | LabelIntermediateSymbol | LiteralIntermediateSymbol | ParameterIntermediateSymbol | ReturnValueIntermediateSymbol
    | LocalVariableIntermediateSymbol;

export type Variable = GlobalVariableIntermediateSymbol | LocalVariableIntermediateSymbol;

/** A symbol that represents a readable (but not necessarily writable) value (location). */
export type ReadableValue = ConstantIntermediateSymbol | GlobalVariableIntermediateSymbol | LiteralIntermediateSymbol
    | LocalVariableIntermediateSymbol;
