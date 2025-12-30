import * as IntermediateSymbols from '../intermediateSymbols';
import { IntermediateKind } from '../intermediateKind';

/**
 * Stores the value into a field from a structure.
 */
export class StoreFieldIntermediate
{
    public readonly kind: IntermediateKind.StoreField;

    public readonly from: IntermediateSymbols.LocalVariable;
    public readonly structure: IntermediateSymbols.Structure;
    public readonly thisReference: IntermediateSymbols.Variable;
    public readonly field: IntermediateSymbols.Field;

    constructor (
        from: IntermediateSymbols.LocalVariable,
        structure: IntermediateSymbols.Structure,
        thisReference: IntermediateSymbols.Variable,
        field: IntermediateSymbols.Field
    ) {
        this.kind = IntermediateKind.StoreField;

        this.from = from;
        this.structure = structure;
        this.field = field;
        this.thisReference = thisReference;
    }
}
