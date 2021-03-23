import Assembler from '../../assembler';
import childProcess from 'child_process';

export default class AssemblerAmd64Linux implements Assembler
{
    public run (assemblyPath: string, outputPath: string): void
    {
        childProcess.execSync('nasm -a -f elf64 -o ' + outputPath + ' "' + assemblyPath + '"');
    }
}
