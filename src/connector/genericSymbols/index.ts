export { ConcreteTypeGenericSymbol as ConcreteType } from './concreteTypeGenericSymbol';
export { FieldGenericSymbol as Field } from './fieldGenericSymbol';
export { FunctionGenericSymbol as Function } from './functionGenericSymbol';
export { FunctionParameterGenericSymbol as FunctionParameter } from './functionParameterGenericSymbol';
export { GenericTypeGenericSymbol as GenericType } from './genericTypeGenericSymbol';
export { GenericTypeParameterGenericSymbol as GenericTypeParameter } from './genericTypeParameterGenericSymbol';
export { LabelGenericSymbol as Label } from './labelGenericSymbol';
export { ModuleGenericSymbol as Module } from './moduleGenericSymbol';
export { VariableGenericSymbol as Variable } from './variableGenericSymbol';

import { ConcreteTypeGenericSymbol } from './concreteTypeGenericSymbol';
import { FieldGenericSymbol } from './fieldGenericSymbol';
import { FunctionGenericSymbol } from './functionGenericSymbol';
import { FunctionParameterGenericSymbol } from './functionParameterGenericSymbol';
import { GenericTypeGenericSymbol } from './genericTypeGenericSymbol';
import { GenericTypeParameterGenericSymbol } from './genericTypeParameterGenericSymbol';
import { LabelGenericSymbol } from './labelGenericSymbol';
import { ModuleGenericSymbol } from './moduleGenericSymbol';
import { VariableGenericSymbol } from './variableGenericSymbol';

export type GenericSymbol<TypeLike, ClassType> =
    | ConcreteTypeGenericSymbol<TypeLike>
    | FieldGenericSymbol<TypeLike>
    | FunctionParameterGenericSymbol<TypeLike>
    | FunctionGenericSymbol<TypeLike>
    | GenericTypeParameterGenericSymbol<TypeLike>
    | GenericTypeGenericSymbol<TypeLike>
    | LabelGenericSymbol
    | ModuleGenericSymbol<ClassType, TypeLike>
    | VariableGenericSymbol<TypeLike>;

export type VariableLike<TypeLike> =
    | FunctionParameterGenericSymbol<TypeLike>
    | VariableGenericSymbol<TypeLike>;

export type Writable<TypeLike> =
    FieldGenericSymbol<TypeLike>
    | VariableGenericSymbol<TypeLike>;
