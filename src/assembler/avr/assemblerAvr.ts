import { Assembler } from '../assembler';
import childProcess from 'child_process';

export class AssemblerAvr implements Assembler
{
    public run (assemblyPath: string, outputPath: string): void
    {
        childProcess.execSync(
            'avr-as ' +
            '-mmcu=avr25 ' + // TODO: This is temporary. In the future we should set it dynamically.
            '--mlink-relax ' + // Automatically replace jmp/call instructions with rjmp/rcall.
            '-o "' + outputPath + '" ' +
            '"' + assemblyPath + '"'
        );
    }
}
