import childProcess from 'child_process';

export default class Linker
{
    public run (outputPath: string, files: string[]): void
    {
        const filesAsString = files.join('" "');

        childProcess.execSync('ld -o "' + outputPath + '" "' + filesAsString + '"');
    }
}
