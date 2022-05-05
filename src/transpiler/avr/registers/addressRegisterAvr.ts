import { RegisterPairAvr } from './registerPairAvr';

export class AddressRegisterAvr extends RegisterPairAvr
{
    /** The full name of the address register */
    public readonly fullName: string;

    constructor (lowName: string, highName: string, fullName: string)
    {
        super(lowName, highName);

        this.fullName = fullName;
    }
}
