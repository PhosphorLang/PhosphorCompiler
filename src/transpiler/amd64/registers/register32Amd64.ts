import { Register16Amd64 } from './register16Amd64';

export class Register32Amd64 extends Register16Amd64
{
    public readonly bit32: string;

    constructor (bit32: string, bit16: string, bit8: string)
    {
        super(bit16, bit8);

        this.bit32 = bit32;
    }
}
