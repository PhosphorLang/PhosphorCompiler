import * as SemanticSymbols from './semanticSymbols';

export interface ModuleContext
{
    readonly module: SemanticSymbols.Module;
}

export interface ClassContext
{
    genericType: SemanticSymbols.GenericType|null;
}

export interface FunctionContext extends ModuleContext
{
    readonly function: SemanticSymbols.Function;
}
