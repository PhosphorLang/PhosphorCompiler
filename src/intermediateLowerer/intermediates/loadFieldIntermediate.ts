import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Load a the value of field from a structure into somethind writable.
 */
export class LoadFieldIntermediate
{
    public readonly kind: IntermediateKind.LoadField;

    public readonly to: IntermediateSymbols.WritableValue;
    public readonly structure: IntermediateSymbols.Structure;
    public readonly thisReference: IntermediateSymbols.Variable;
    public readonly field: IntermediateSymbols.Field;

    constructor (
        to: IntermediateSymbols.WritableValue,
        structure: IntermediateSymbols.Structure,
        thisReference: IntermediateSymbols.Variable,
        field: IntermediateSymbols.Field
    ) {
        this.kind = IntermediateKind.LoadField;

        this.to = to;
        this.structure = structure;
        this.field = field;
        this.thisReference = thisReference;
    }
}
