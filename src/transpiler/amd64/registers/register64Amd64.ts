import Register32Amd64 from "./register32Amd64";

export default class Register64Amd64 extends Register32Amd64
{
    public readonly bit64: string;

    constructor (bit64: string, bit32: string, bit16: string, bit8: string)
    {
        super(bit32, bit16, bit8);

        this.bit64 = bit64;
    }
}
