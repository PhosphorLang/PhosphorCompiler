import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * The given readable value is parameterised, which means that it is used as the given parameter symbol in the next function call. \
 * Logically this is a move instruction. However, the transpiler implementation can optimise this away, for example by creating
 * the value directly in the register that will be used for the corresponding parameter. \
 * All parameterisations are reset after the next function call.
 */
export class ParameteriseIntermediate
{
    public readonly kind: IntermediateKind.Parameterise;

    public parameterSymbol: IntermediateSymbols.Parameter;
    public readableValue: IntermediateSymbols.ReadableValue;

    constructor (parameterSymbol: IntermediateSymbols.Parameter, readableValue: IntermediateSymbols.ReadableValue)
    {
        this.kind = IntermediateKind.Parameterise;

        this.parameterSymbol = parameterSymbol;
        this.readableValue = readableValue;
    }
}
