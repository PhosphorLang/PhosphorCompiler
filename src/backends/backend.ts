import type * as Intermediates from '../intermediateLowerer/intermediates';

export interface Backend
{
    compile (
        fileIntermediate: Intermediates.File,
        moduleQualifiedName: string,
        libraryPath: string,
        temporaryDirectoryPath: string
    ): string;

    link (inputFilePaths: string[], standardLibraryPath: string, outputFilePath: string): void;
}
