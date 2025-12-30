import * as Intermediates from '../intermediateLowerer/intermediates';
import { Backend } from './backend';
import FileSystem from 'fs';
import { GccCompiler } from './gcc/gccCompiler';
import { GnuLinker } from '../linker/gnu/gnuLinker';
import Path from 'path';
import { TranspilerC } from '../transpiler/c/transpilerC';

export class LinuxAmd64GccBackend implements Backend
{
    public compile (
        fileIntermediate: Intermediates.File,
        moduleQualifiedName: string,
        libraryPath: string,
        temporaryDirectoryPath: string
    ): string
    {
        const transpiler = new TranspilerC();
        const compiler = new GccCompiler();

        const source = transpiler.run(fileIntermediate);

        // TODO: Better temporary file naming for the two temporary files.

        const temporarySourceFilePath = Path.join(temporaryDirectoryPath, moduleQualifiedName + '.c');
        FileSystem.writeFileSync(temporarySourceFilePath, source, {encoding: 'utf8'});

        const temporaryObjectFilePath = Path.join(temporaryDirectoryPath, moduleQualifiedName + '.o');
        compiler.run(temporarySourceFilePath, temporaryObjectFilePath, libraryPath);

        return temporaryObjectFilePath;
    }

    public link (inputFilePaths: string[], standardLibraryPath: string, outputFilePath: string): void
    {
        const linker = new GnuLinker();

        linker.run(outputFilePath, inputFilePaths, [standardLibraryPath]);
    }
}
