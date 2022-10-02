import { Assembler } from '../assembler';
import FileSystem from 'fs';

export class AssemblerBackseat implements Assembler
{
    public run (assemblyPath: string, outputPath: string): void
    {
        // In Backseat, assembler and linker are combined in the "Upholsterer", thus we do nothing here and let linker do everything.
        FileSystem.copyFileSync(assemblyPath, outputPath);
    }
}
