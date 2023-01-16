import childProcess from 'child_process';
import { NasmAssemblerTarget } from './nasmAssemblerTarget';

export class NasmAssembler
{
    public run (assemblyPath: string, outputPath: string, nasmTarget: NasmAssemblerTarget): void
    {
        childProcess.execSync('nasm -a -f ' + nasmTarget + ' -o ' + outputPath + ' "' + assemblyPath + '"');
    }
}
