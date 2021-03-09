import childProcess from 'child_process';

export default class Linker
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
