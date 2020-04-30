export default class Register64
{
    public readonly bit64: string;
    public readonly bit32: string;
    public readonly bit16: string;
    public readonly bit8: string;

    constructor (bit64: string, bit32: string, bit16: string, bit8: string)
    {
        this.bit64 = bit64;
        this.bit32 = bit32;
        this.bit16 = bit16;
        this.bit8 = bit8;
    }
}
