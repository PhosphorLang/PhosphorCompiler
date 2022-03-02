import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Receive the given receivable value, which means that a parameter or return value can be used as a variable. \
 * Logically this is a move instruction. However, the transpiler implementation can optimise this away, for example by reusing
 * the register the value is from as the register of the newly created variable. \
 * As such, this is the complementary instruction for parameterise and return.
 */
export class ReceiveIntermediate
{
    public readonly kind: IntermediateKind.Receive;

    public variableSymbol: IntermediateSymbols.Variable;
    public receivableValue: IntermediateSymbols.Parameter | IntermediateSymbols.ReturnValue;

    constructor (
        variableSymbol: IntermediateSymbols.Variable,
        receivableValue: IntermediateSymbols.Parameter | IntermediateSymbols.ReturnValue
    ) {
        this.kind = IntermediateKind.Receive;

        this.variableSymbol = variableSymbol;
        this.receivableValue = receivableValue;
    }
}
