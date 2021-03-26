import Assembler from '../assembler';
import childProcess from 'child_process';

export default class AssemblerAvr implements Assembler
{
    public run (assemblyPath: string, outputPath: string): void
    {
        childProcess.execSync(
            'avr-as ' +
            '-o "' + outputPath + '" ' +
            '"' + assemblyPath + '"'
        );
    }
}
