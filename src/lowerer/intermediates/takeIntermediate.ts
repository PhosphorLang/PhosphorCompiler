import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Take the given takable value, which means that a parameter or return value can be used as a variable. \
 * Logically this is a move instruction. However, the transpiler implementation can optimise this away, for example by reusing
 * the register the value is from as the register of the newly created variable. \
 * As such, this is the complementary instruction for the give intermediate.
 */
export class TakeIntermediate
{
    public readonly kind: IntermediateKind.Take;

    public variableSymbol: IntermediateSymbols.Variable;
    public takableValue: IntermediateSymbols.Parameter | IntermediateSymbols.ReturnValue;

    constructor (
        variableSymbol: IntermediateSymbols.Variable,
        takableValue: IntermediateSymbols.Parameter | IntermediateSymbols.ReturnValue
    ) {
        this.kind = IntermediateKind.Take;

        this.variableSymbol = variableSymbol;
        this.takableValue = takableValue;
    }
}
