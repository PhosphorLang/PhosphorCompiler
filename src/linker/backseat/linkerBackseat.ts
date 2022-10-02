import childProcess from 'child_process';
import FileSystem from 'fs';
import { Linker } from '../linker';

export class LinkerBackseat implements Linker
{
    public run (outputPath: string, files: string[], libraries: string[]): void
    {
        // Write the temporary combined Bssembly file next to the main code file which was copied there by the assembler class:
        const tempPath = files[0] + '.tmp.bsm';

        FileSystem.writeFileSync(tempPath, '');

        for (const codeFilePath of files)
        {
            FileSystem.appendFileSync(tempPath, FileSystem.readFileSync(codeFilePath));
        }

        for (const libraryFilePath of libraries)
        {
            FileSystem.appendFileSync(tempPath, FileSystem.readFileSync(libraryFilePath));
        }

        childProcess.execSync(
            'Upholsterer2k ' +
            tempPath + ' ' +
            '> ' + outputPath
        );
    }
}
