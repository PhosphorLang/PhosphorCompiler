import * as GenericSymbols from '../genericSymbols';

export class ConcreteType extends GenericSymbols.ConcreteType<TypeLike> {}
export class Field extends GenericSymbols.Field<TypeLike> {}
export class FunctionParameter extends GenericSymbols.FunctionParameter<TypeLike> {}
class FunctionSymbol extends GenericSymbols.Function<TypeLike> {}
export { FunctionSymbol as Function };
export class GenericTypeParameter extends GenericSymbols.GenericTypeParameter<TypeLike> {}
export class GenericType extends GenericSymbols.GenericType<TypeLike> {}
export class Label extends GenericSymbols.Label {}
export class Module extends GenericSymbols.Module<GenericType, TypeLike> {}
export class Variable extends GenericSymbols.Variable<TypeLike> {}

export type SemanticSymbol =
    | ConcreteType
    | Field
    | FunctionParameter
    | FunctionSymbol
    | GenericTypeParameter
    | GenericType
    | Label
    | Module
    | Variable;

export type TypeLike = // TODO: Find a better name.
    | ConcreteType
    | GenericTypeParameter;

export type VariableLike =
    | FunctionParameter
    | Variable;

export type Writable =
    Field
    | Variable;
