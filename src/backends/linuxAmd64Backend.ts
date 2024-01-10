import * as Intermediates from '../intermediateLowerer/intermediates';
import FileSystem from 'fs';
import { GnuLinker } from '../linker/gnu/gnuLinker';
import { LinuxAmd64GnuAssembler } from '../assembler/linuxAmd64Gnu/linuxAmd64GnuAssembler';
import { LlvmCompiler } from './llvm/llvmCompiler';
import { LlvmCompilerTarget } from './llvm/llvmCompilerTarget';
import Path from 'path';
import { TranspilerLlvm } from '../transpiler/llvm/transpilerLlvm';

export class LinuxAmd64Backend
{
    public compile (fileIntermediate: Intermediates.File, moduleQualifiedName: string, temporaryDirectoryPath: string): string
    {
        const transpiler = new TranspilerLlvm();
        const compiler = new LlvmCompiler();
        const assembler = new LinuxAmd64GnuAssembler();

        const assembly = transpiler.run(fileIntermediate);

        // TODO: Better temporary file naming for the two temporary files.

        const temporaryLlvmIrFilePath = Path.join(temporaryDirectoryPath, moduleQualifiedName + '.ll');
        FileSystem.writeFileSync(temporaryLlvmIrFilePath, assembly, {encoding: 'utf8'});

        const temporaryAssemblyFilePath = Path.join(temporaryDirectoryPath, moduleQualifiedName + '.s');
        compiler.run(temporaryLlvmIrFilePath, temporaryAssemblyFilePath, LlvmCompilerTarget.LinuxAmd64);

        const temporaryObjectFilePath = Path.join(temporaryDirectoryPath, moduleQualifiedName + '.o');
        assembler.run(temporaryAssemblyFilePath, temporaryObjectFilePath);

        return temporaryObjectFilePath;
    }

    public link (inputFilePaths: string[], standardLibraryPath: string, outputFilePath: string): void
    {
        const linker = new GnuLinker(); // TODO: Should we switch to the LLVM linker (llvm-ld alias lld)?

        linker.run(outputFilePath, inputFilePaths, [standardLibraryPath]);
    }
}
