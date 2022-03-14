import childProcess from 'child_process';
import { Linker } from '../../linker';
import path from 'path';

export class LinkerAmd64Linux implements Linker
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
            'ld ' +
            '-e _start ' +
            '-s --gc-sections -n ' +
            '-nostdlib ' +
            '-o "' + outputPath + '" ' +
            '"' + filesAsString + '" ' +
            libraryImports
        );
    }
}
