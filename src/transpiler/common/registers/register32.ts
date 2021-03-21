import Register16 from "./register16";

export default class Register32 extends Register16
{
    public readonly bit32: string;

    constructor (bit32: string, bit16: string, bit8: string)
    {
        super(bit16, bit8);

        this.bit32 = bit32;
    }
}
