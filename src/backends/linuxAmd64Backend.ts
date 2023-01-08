import * as Intermediates from '../lowerer/intermediates';
import FileSystem from 'fs';
import { GnuLinker } from '../linker/gnu/gnuLinker';
import { NasmAssembler } from '../assembler/nasm/nasmAssembler';
import { NasmAssemblerTarget } from '../assembler/nasm/nasmAssemblerTarget';
import Path from 'path';
import { TranspilerAmd64Linux } from '../transpiler/amd64/linux/transpilerAmd64Linux';

export class LinuxAmd64Backend
{
    public run (
        fileIntermediate: Intermediates.File,
        standardLibraryPath: string,
        temporaryDirectoryPath: string,
        outputFilePath: string,
        ): void
    {
        const transpiler = new TranspilerAmd64Linux();
        const assembler = new NasmAssembler();
        const linker = new GnuLinker();

        const assembly = transpiler.run(fileIntermediate);

        // TODO: Better temporary file naming for the two temporary files.

        const temporaryAssemblyFilePath = Path.join(temporaryDirectoryPath, 'test.asm');
        FileSystem.writeFileSync(temporaryAssemblyFilePath, assembly, {encoding: 'utf8'});

        const temporaryObjectFilePath = Path.join(temporaryDirectoryPath, 'test.o');
        assembler.run(temporaryAssemblyFilePath, temporaryObjectFilePath, NasmAssemblerTarget.Elf64);

        const linkerFiles = [temporaryObjectFilePath];
        const libraryFiles = [standardLibraryPath];

        linker.run(outputFilePath, linkerFiles, libraryFiles);
    }
}
