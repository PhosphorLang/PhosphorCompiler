import childProcess from 'child_process';
import { Linker } from '../linker';
import path from 'path';

export class LinkerAvr implements Linker
{
    public run (outputPath: string, files: string[], libraries: string[]): void
    {
        const filesAsString = files.join('" "'); // TODO: Give a better name.

        let libraryImports = '';

        for (const libraryFilePath of libraries)
        {
            const libraryPath = path.dirname(libraryFilePath);
            const libraryFile = path.basename(libraryFilePath);

            libraryImports += '-L"' + libraryPath + '" ';
            libraryImports += '-l":' + libraryFile + '" ';
        }

        childProcess.execSync(
            'avr-ld ' +
            '-e _start ' +
            '-s --gc-sections -n ' +
            '-nostdlib ' +
            '--relax ' + // Automatically replace jmp/call instructions with rjmp/rcall.
            '-o "' + outputPath + '" ' +
            '"' + filesAsString + '" ' +
            libraryImports
        );
    }
}
