import * as Intermediates from '../lowerer/intermediates';
import FileSystem from 'fs';
import { GnuLinker } from '../linker/gnu/gnuLinker';
import { LinuxAmd64GnuAssembler } from '../assembler/linuxAmd64Gnu/linuxAmd64GnuAssembler';
import { LlvmCompiler } from './llvm/llvmCompiler';
import { LlvmCompilerTarget } from './llvm/llvmCompilerTarget';
import Path from 'path';
import { TranspilerLlvm } from '../transpiler/llvm/transpilerLlvm';

export class LinuxAmd64Backend
{
    public run (
        fileIntermediate: Intermediates.File,
        standardLibraryPath: string,
        temporaryDirectoryPath: string,
        outputFilePath: string,
        ): void
    {
        const transpiler = new TranspilerLlvm();
        const compiler = new LlvmCompiler();
        const assembler = new LinuxAmd64GnuAssembler();
        const linker = new GnuLinker();

        const assembly = transpiler.run(fileIntermediate);

        // TODO: Better temporary file naming for the two temporary files.

        const temporaryLlvmIrFilePath = Path.join(temporaryDirectoryPath, 'test.ll');
        FileSystem.writeFileSync(temporaryLlvmIrFilePath, assembly, {encoding: 'utf8'});

        const temporaryAssemblyFilePath = Path.join(temporaryDirectoryPath, 'test.s');
        compiler.run(temporaryLlvmIrFilePath, temporaryAssemblyFilePath, LlvmCompilerTarget.LinuxAmd64);

        const temporaryObjectFilePath = Path.join(temporaryDirectoryPath, 'test.o');
        assembler.run(temporaryAssemblyFilePath, temporaryObjectFilePath);

        const linkerFiles = [temporaryObjectFilePath];
        const libraryFiles = [standardLibraryPath];

        linker.run(outputFilePath, linkerFiles, libraryFiles);
    }
}
