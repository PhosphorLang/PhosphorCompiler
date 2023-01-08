import ChildProcess from 'child_process';

export class LinuxAmd64GnuAssembler
{
    public run (assemblyPath: string, outputPath: string): void
    {
        ChildProcess.execSync('x86_64-linux-gnu-as -o ' + outputPath + ' "' + assemblyPath + '"');
    }
}
