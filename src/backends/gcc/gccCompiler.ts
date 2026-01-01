import ChildProcess from 'child_process';

export class GccCompiler
{
    public run (inputFile: string, outputFile: string, libraryPath: string): void
    {
        ChildProcess.execSync(
            'gcc ' +
            '-nostdinc ' +
            '-fno-stack-protector ' +
            '-fdata-sections ' +
            '-ffunction-sections ' +
            '-fno-builtin ' +
            '-fno-asynchronous-unwind-tables ' +
            '-fno-ident ' +
            '-finhibit-size-directive ' +
            '-masm=intel ' +
            '-O2 ' +
            '-c ' +
            '-I "' + libraryPath + '" ' +
            '-o "' + outputFile + '" ' +
            inputFile
        );
    }
}
