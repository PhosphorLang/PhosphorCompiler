import * as Intermediates from '../lowerer/intermediates';

export default interface Transpiler
{
    run (fileIntermediate: Intermediates.File): string;
}
