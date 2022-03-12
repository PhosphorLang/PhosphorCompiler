import { IntermediateKind } from '../intermediateKind';

/**
 * Return from the current function. \
 * All return values must previously be given.
 */
export class ReturnIntermediate
{
    public readonly kind: IntermediateKind.Return;

    constructor ()
    {
        this.kind = IntermediateKind.Return;
    }
}
