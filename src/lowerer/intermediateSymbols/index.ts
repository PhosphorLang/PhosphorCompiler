export { ConstantIntermediateSymbol as Constant } from './constantIntermediateSymbol';
export { FunctionIntermediateSymbol as Function } from './functionIntermediateSymbol';
export { LabelIntermediateSymbol as Label } from './labelIntermediateSymbol';
export { ParameterIntermediateSymbol as Parameter } from './parameterIntermediateSymbol';
export { VariableIntermediateSymbol as Variable } from './variableIntermediateSymbol';

import { ConstantIntermediateSymbol } from './constantIntermediateSymbol';
import { FunctionIntermediateSymbol } from './functionIntermediateSymbol';
import { LabelIntermediateSymbol } from './labelIntermediateSymbol';
import { ParameterIntermediateSymbol } from './parameterIntermediateSymbol';
import { VariableIntermediateSymbol } from './variableIntermediateSymbol';

export type IntermediateSymbol =
    ConstantIntermediateSymbol | FunctionIntermediateSymbol | LabelIntermediateSymbol | ParameterIntermediateSymbol
    | VariableIntermediateSymbol;

/** A symbol that represents a readable (but not necessarily writable) value (location). */
export type ReadableValue = ConstantIntermediateSymbol | VariableIntermediateSymbol;
