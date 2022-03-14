export interface Linker
{
    run (outputPath: string, files: string[], libraries: string[]): void;
}
