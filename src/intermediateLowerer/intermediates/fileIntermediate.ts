import { ConstantIntermediate } from './constantIntermediate';
import { ExternalIntermediate } from './externalIntermediate';
import { FunctionIntermediate } from './functionIntermediate';
import { GlobalIntermediate } from './globalIntermediate';
import { IntermediateKind } from '../intermediateKind';
import { StructureIntermediate } from './structureIntermediate';

/**
 * The main intermediate class that contains/wraps all other intermediates.
 */
export class FileIntermediate
{
    public readonly kind: IntermediateKind.File;

    public constants: ConstantIntermediate[];
    public externals: ExternalIntermediate[];
    public globals: GlobalIntermediate[];
    public functions: FunctionIntermediate[];

    public structure: StructureIntermediate|null;

    public isEntryPoint: boolean;

    constructor (
        constants: ConstantIntermediate[],
        externals: ExternalIntermediate[],
        globals: GlobalIntermediate[],
        functions: FunctionIntermediate[],
        structure: StructureIntermediate|null,
        isEntryPoint: boolean
    ){
        this.kind = IntermediateKind.File;

        this.constants = constants;
        this.externals = externals;
        this.globals = globals;
        this.functions = functions;

        this.structure = structure;

        this.isEntryPoint = isEntryPoint;
    }
}
