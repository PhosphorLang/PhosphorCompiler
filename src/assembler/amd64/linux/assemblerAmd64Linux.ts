import Assembler from '../../assembler';

export default class AssemblerAmd64Linux extends Assembler
{
    constructor ()
    {
        super();

        this.format = 'elf64';
    }
}
