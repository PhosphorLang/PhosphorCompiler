export { ConcreteTypeSemanticSymbol as ConcreteType } from './concreteTypeSemanticSymbol';
export { FieldSemanticSymbol as Field } from './fieldSemanticSymbol';
export { FunctionParameterSemanticSymbol as FunctionParameter } from './functionParameterSemanticSymbol';
export { FunctionSemanticSymbol as Function } from './functionSemanticSymbol';
export { GenericParameterSemanticSymbol as GenericParameter } from './genericParameterSemanticSymbol';
export { GenericTypeSemanticSymbol as GenericType } from './genericTypeSemanticSymbol';
export { LabelSemanticSymbol as Label } from './labelSemanticSymbol';
export { LiteralConcreteParameterSemanticSymbol as LiteralConcreteParameter } from './literalConcreteParemeterSemanticSymbol';
export { ModuleSemanticSymbol as Module } from './moduleSemanticSymbol';
export { TypeConcreteParameterSemanticSymbol as TypeConcreteParameter } from './typeConcreteParameterSemanticSymbol';
export { VariableSemanticSymbol as Variable } from './variableSemanticSymbol';

import { ConcreteTypeSemanticSymbol } from './concreteTypeSemanticSymbol';
import { FieldSemanticSymbol } from './fieldSemanticSymbol';
import { FunctionParameterSemanticSymbol } from './functionParameterSemanticSymbol';
import { FunctionSemanticSymbol } from './functionSemanticSymbol';
import { GenericParameterSemanticSymbol } from './genericParameterSemanticSymbol';
import { GenericTypeSemanticSymbol } from './genericTypeSemanticSymbol';
import { LabelSemanticSymbol } from './labelSemanticSymbol';
import { LiteralConcreteParameterSemanticSymbol } from './literalConcreteParemeterSemanticSymbol';
import { ModuleSemanticSymbol } from './moduleSemanticSymbol';
import { TypeConcreteParameterSemanticSymbol } from './typeConcreteParameterSemanticSymbol';
import { VariableSemanticSymbol } from './variableSemanticSymbol';

export type SemanticSymbol =
    | ConcreteTypeSemanticSymbol
    | FieldSemanticSymbol
    | FunctionParameterSemanticSymbol
    | FunctionSemanticSymbol
    | GenericParameterSemanticSymbol
    | GenericTypeSemanticSymbol
    | LabelSemanticSymbol
    | LiteralConcreteParameterSemanticSymbol
    | ModuleSemanticSymbol
    | TypeConcreteParameterSemanticSymbol
    | VariableSemanticSymbol;

export type Type =
    | ConcreteTypeSemanticSymbol
    | GenericTypeSemanticSymbol;

export type VariableLike =
    | FieldSemanticSymbol
    | FunctionParameterSemanticSymbol
    | VariableSemanticSymbol;

export type ConcreteParameter =
    | LiteralConcreteParameterSemanticSymbol
    | TypeConcreteParameterSemanticSymbol;
