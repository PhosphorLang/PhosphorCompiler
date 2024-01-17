import * as SemanticSymbols from './semanticSymbols';
import { AllOrNone } from '../utility/allOrNone';

interface AllClassContext
{
    genericType: SemanticSymbols.GenericType;
    concreteType: SemanticSymbols.ConcreteType;
}

export type ClassContext = AllOrNone<AllClassContext>;

export interface ModuleContext
{
    readonly module: SemanticSymbols.Module;
}

export interface FunctionContext extends ModuleContext
{
    readonly function: SemanticSymbols.Function;
}
