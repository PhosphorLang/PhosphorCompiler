export default interface Linker
{
    run (outputPath: string, files: string[]): void;
}
