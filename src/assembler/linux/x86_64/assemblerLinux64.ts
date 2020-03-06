import Assembler from '../../assembler';

export default class AssemblerLinux64 extends Assembler
{
    constructor ()
    {
        super();

        this.format = 'elf64';
        this.standardLibraryPath = 'src/assembler/linux/x86_64/library/standard.asm';
    }
}
