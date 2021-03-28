import childProcess from 'child_process';
import Linker from '../linker';

export default class LinkerAvr implements Linker
{
    public run (outputPath: string, files: string[]): void
    {
        const filesAsString = files.join('" "'); // TODO: Give a better name.

        childProcess.execSync(
            'avr-ld ' +
            '-e _start ' +
            '-s --gc-sections ' +
            '-nostdlib -nolibc ' +
            '--relax ' + // Automatically replace jmp/call instructions with rjmp/rcall.
            '-o "' + outputPath + '" ' +
            '"' + filesAsString + '"'
        );
    }
}
