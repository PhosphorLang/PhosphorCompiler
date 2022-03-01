import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

export class ParameteriseIntermediate
{
    public readonly kind: IntermediateKind.Parameterise;

    public parameterSymbol: IntermediateSymbols.Parameter;
    public variableSymbol: IntermediateSymbols.Variable;

    constructor (parameterSymbol: IntermediateSymbols.Parameter, variableSymbol: IntermediateSymbols.Variable)
    {
        this.kind = IntermediateKind.Parameterise;

        this.parameterSymbol = parameterSymbol;
        this.variableSymbol = variableSymbol;
    }
}
