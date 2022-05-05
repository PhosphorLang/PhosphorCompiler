import * as Intermediates from '../lowerer/intermediates';

export interface Transpiler
{
    run (fileIntermediate: Intermediates.File): string;
}
