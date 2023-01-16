import { AvrAssemblerTarget } from './avrAssemblerTarget';
import ChildProcess from 'child_process';

export class AvrAssembler
{
    public run (assemblyPath: string, outputPath: string, target: AvrAssemblerTarget): void
    {
        ChildProcess.execSync(
            'avr-as ' +
            '-mmcu=' + target + ' ' + // TODO: This is temporary. In the future we should set it dynamically.
            '--mlink-relax ' + // Automatically replace jmp/call instructions with rjmp/rcall.
            '-o "' + outputPath + '" ' +
            '"' + assemblyPath + '"'
        );
    }
}
