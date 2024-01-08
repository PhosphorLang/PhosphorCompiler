import ChildProcess from 'child_process';
import { LlvmCompilerTarget } from './llvmCompilerTarget';

export class LlvmCompiler
{
    public run (inputFile: string, outputFile: string, target: LlvmCompilerTarget): void
    {
        ChildProcess.execSync(
            'llc-14 ' +
            '--opaque-pointers ' +
            '-mtriple=' + target + ' ' +
            '-o "' + outputFile + '" ' +
            inputFile
        );
    }
}
