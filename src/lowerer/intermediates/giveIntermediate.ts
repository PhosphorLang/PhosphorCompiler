import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * The readable value is given, which means that it is used as the target symbol (a parameter or return value). \
 * Logically this is an introduce followed by a move instruction. However, the transpiler implementation can optimise this away,
 * for example by creating the value directly in the register that will be used for the corresponding parameter or return. \
 * If given a paramater symbol, the value is dismissed after the next function call. If given a return value, it is dismissed after the
 * next return instruction.
 */
export class GiveIntermediate
{
    public readonly kind: IntermediateKind.Give;

    public targetSymbol: IntermediateSymbols.Parameter | IntermediateSymbols.ReturnValue;
    public readableValue: IntermediateSymbols.ReadableValue;

    constructor (targetSymbol: IntermediateSymbols.Parameter | IntermediateSymbols.ReturnValue, readableValue: IntermediateSymbols.ReadableValue)
    {
        this.kind = IntermediateKind.Give;

        this.targetSymbol = targetSymbol;
        this.readableValue = readableValue;
    }
}
