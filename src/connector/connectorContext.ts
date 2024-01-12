import * as SemanticSymbols from './semanticSymbols';

export interface ModuleContext
{
    readonly module: SemanticSymbols.Module;
}

export interface FunctionContext extends ModuleContext
{
    readonly function: SemanticSymbols.Function;
}
