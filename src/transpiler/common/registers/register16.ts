import Register8 from "./register8";

export default class Register16 extends Register8
{
    public readonly bit16: string;

    constructor (bit16: string, bit8: string)
    {
        super(bit8);

        this.bit16 = bit16;
    }
}
