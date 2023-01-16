import * as SemanticNodes from '../connector/semanticNodes';
import { AvrAssembler } from '../assembler/avr/avrAssembler';
import { AvrAssemblerTarget } from '../assembler/avr/avrAssemblerTarget';
import { AvrLinker } from '../linker/avr/avrLinker';
import FileSystem from 'fs';
import Path from 'path';
import { TranspilerAvr } from '../transpiler/avr/transpilerAvr';

export class AvrBackend
{
    public run (
        semanticTree: SemanticNodes.File,
        standardLibraryPath: string,
        temporaryDirectoryPath: string,
        outputFilePath: string,
        ): void
    {
        const transpiler = new TranspilerAvr();
        const assembler = new AvrAssembler();
        const linker = new AvrLinker();

        const assembly = transpiler.run(semanticTree);

        // TODO: Better temporary file naming for the two temporary files.

        const temporaryAssemblyFilePath = Path.join(temporaryDirectoryPath, 'test.asm');
        FileSystem.writeFileSync(temporaryAssemblyFilePath, assembly, {encoding: 'utf8'});

        const temporaryObjectFilePath = Path.join(temporaryDirectoryPath, 'test.o');
        assembler.run(temporaryAssemblyFilePath, temporaryObjectFilePath, AvrAssemblerTarget.Avr25);

        const linkerFiles = [temporaryObjectFilePath];
        const libraryFiles = [standardLibraryPath];

        linker.run(outputFilePath, linkerFiles, libraryFiles);
    }
}
