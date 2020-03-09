import childProcess from 'child_process';

export default abstract class Assembler
{
    protected format: string;
    protected standardLibraryPath: string;

    constructor ()
    {
        this.format = '';
        this.standardLibraryPath = '';
    }

    public run (assemblyPath: string): void
    {
        // Standard library:
        childProcess.execSync('nasm -a -f ' + this.format + ' -o tmp/standard.o "' + this.standardLibraryPath + '"');

        // Assembly:
        childProcess.execSync('nasm -a -f ' + this.format + ' -o tmp/test.o "' + assemblyPath + '"');
    }
}
