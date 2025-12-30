import * as GenericSymbol from '../../connector/genericSymbols';

export class ConcreteType extends GenericSymbol.ConcreteType<ConcreteType> {}
export class Field extends GenericSymbol.Field<ConcreteType> {}
export class FunctionParameter extends GenericSymbol.FunctionParameter<ConcreteType> {}
class FunctionSymbol extends GenericSymbol.Function<ConcreteType> {}
export { FunctionSymbol as Function };
export class GenericTypeParameter extends GenericSymbol.GenericTypeParameter<ConcreteType> {}
export class GenericType extends GenericSymbol.GenericType<GenericTypeParameter> {}
export class Label extends GenericSymbol.Label {}
export class Module extends GenericSymbol.Module<ConcreteType, ConcreteType> {}
export class Variable extends GenericSymbol.Variable<ConcreteType> {}

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

export type VariableLike =
    | FunctionParameter
    | Variable;

export type Writable =
    Field
    | Variable;
