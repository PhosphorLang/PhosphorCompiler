import childProcess from 'child_process';

export default abstract class Assembler
{
    protected format: string;

    constructor ()
    {
        this.format = '';
    }

    public run (assemblyPath: string): void
    {
        // Assembly:
        childProcess.execSync('nasm -a -f ' + this.format + ' -o tmp/test.o "' + assemblyPath + '"');
    }
}
