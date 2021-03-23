import childProcess from 'child_process';
import Linker from '../../linker';

export default class LinkerAmd64Linux implements Linker
{
    public run (outputPath: string, files: string[]): void
    {
        const filesAsString = files.join('" "'); // TODO: Give a better name.

        childProcess.execSync(
            'ld ' +
            '-e _start ' +
            '-s --gc-sections ' +
            '-nostdlib -nolibc ' +
            '-o "' + outputPath + '" ' +
            '"' + filesAsString + '"'
        );
    }
}
