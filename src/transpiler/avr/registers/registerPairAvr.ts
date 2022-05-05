export class RegisterPairAvr
{
    /** The name of the register with the least significant byte */
    public readonly lowName: string;
    /** The name of the register with the most significant byte */
    public readonly highName: string;

    /** The pair representation of the registers */
    public get pairName (): string
    {
        return this.highName + ':' + this.lowName;
    }

    constructor (lowName: string, highName: string)
    {
        this.lowName = lowName;
        this.highName = highName;
    }
}
