import { Register8Amd64 } from './register8Amd64';

export class Register16Amd64 extends Register8Amd64
{
    public readonly bit16: string;

    constructor (bit16: string, bit8: string)
    {
        super(bit8);

        this.bit16 = bit16;
    }
}
