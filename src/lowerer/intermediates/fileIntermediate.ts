import { ConstantIntermediate } from './constantIntermediate';
import { ExternalIntermediate } from './externalIntermediate';
import { FunctionIntermediate } from './functionIntermediate';
import { IntermediateKind } from '../intermediateKind';

/**
 * The main intermediate class that contains/wraps all other intermediates.
 */
export class FileIntermediate
{
    public readonly kind: IntermediateKind.File;

    public functions: FunctionIntermediate[];
    public externals: ExternalIntermediate[];
    public constants: ConstantIntermediate[];

    constructor (functions: FunctionIntermediate[], externals: ExternalIntermediate[], constants: ConstantIntermediate[])
    {
        this.kind = IntermediateKind.File;

        this.functions = functions;
        this.externals = externals;
        this.constants = constants;
    }
}
