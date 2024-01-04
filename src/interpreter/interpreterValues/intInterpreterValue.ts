import { IntermediateSize } from '../../lowerer/intermediateSize';
import { InterpreterValueBase } from './interpreterValueBase';
import { LiteralIntermediateSymbol } from '../../lowerer/intermediateSymbols/literalIntermediateSymbol';

export class IntInterpreterValue extends InterpreterValueBase
{
    private bitness: number;

    private setGetValue = 0n;
    public get value (): bigint
    {
        return this.setGetValue;
    }
    public set value (value: bigint)
    {
        this.setGetValue = BigInt.asIntN(this.bitness, value);
    }

    public readonly size: IntermediateSize.Int8|IntermediateSize.Int16|IntermediateSize.Int32|IntermediateSize.Int64;

    constructor (literal: LiteralIntermediateSymbol)
    {
        super();

        switch (literal.size)
        {
            case IntermediateSize.Int8:
            case IntermediateSize.Int16:
            case IntermediateSize.Int32:
            case IntermediateSize.Int64:
                this.size = literal.size;
                break;
            case IntermediateSize.Native:
                this.size = this.getNativeSize();
                break;
            case IntermediateSize.Void:
            default:
                throw new Error(`Unsupported size: ${literal.size}`);
        }

        switch (this.size)
        {
            case IntermediateSize.Int8:
                this.bitness = 8;
                break;
            case IntermediateSize.Int16:
                this.bitness = 16;
                break;
            case IntermediateSize.Int32:
                this.bitness = 32;
                break;
            case IntermediateSize.Int64:
                this.bitness = 64;
                break;
        }

        this.value = BigInt(literal.value);
    }

    private getNativeSize (): IntermediateSize.Int8|IntermediateSize.Int16|IntermediateSize.Int32|IntermediateSize.Int64
    {
        const architecture = process.arch;
        switch (architecture)
        {
            case 'arm':
            case 'ia32':
            case 'ppc':
            case 's390':
                return IntermediateSize.Int32;
            case 'arm64':
            case 'ppc64':
            case 's390x':
            case 'x64':
                return IntermediateSize.Int64;
            case 'mips':
            case 'mipsel':
            default:
                throw new Error(`Unsupported architecture: ${architecture}`);
        }
    }
}
