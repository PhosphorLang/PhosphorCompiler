export { ConstantIntermediateSymbol as Constant } from './constantIntermediateSymbol';
export { FunctionIntermediateSymbol as Function } from './functionIntermediateSymbol';
export { LabelIntermediateSymbol as Label } from './labelIntermediateSymbol';
export { LiteralIntermediateSymbol as Literal } from './literalIntermediateSymbol';
export { ParameterIntermediateSymbol as Parameter } from './parameterIntermediateSymbol';
export { VariableIntermediateSymbol as Variable } from './variableIntermediateSymbol';

import { ConstantIntermediateSymbol } from './constantIntermediateSymbol';
import { FunctionIntermediateSymbol } from './functionIntermediateSymbol';
import { LabelIntermediateSymbol } from './labelIntermediateSymbol';
import { LiteralIntermediateSymbol } from './literalIntermediateSymbol';
import { ParameterIntermediateSymbol } from './parameterIntermediateSymbol';
import { VariableIntermediateSymbol } from './variableIntermediateSymbol';

export type IntermediateSymbol = ConstantIntermediateSymbol | FunctionIntermediateSymbol | LabelIntermediateSymbol
    | LiteralIntermediateSymbol | ParameterIntermediateSymbol | VariableIntermediateSymbol;

/** A symbol that represents a readable (but not necessarily writable) value (location). */
export type ReadableValue = ConstantIntermediateSymbol | LiteralIntermediateSymbol | VariableIntermediateSymbol;
