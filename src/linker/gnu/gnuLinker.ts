import ChildProcess from 'child_process';
import path from 'path';

export class GnuLinker
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

        ChildProcess.execSync(
            'ld ' +
            '-e _start ' +
            '-s --gc-sections -n ' +
            '-z noexecstack --no-warn-rwx-segments ' +
            '-nostdlib ' +
            '-o "' + outputPath + '" ' +
            '"' + filesAsString + '" ' +
            libraryImports
        );
    }
}
