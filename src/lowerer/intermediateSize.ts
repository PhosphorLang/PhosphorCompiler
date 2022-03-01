export enum IntermediateSize
{
    Int8 = 'Int8',
    Int16 = 'Int16',
    Int32 = 'Int32',
    Int64 = 'Int64',
    /** The word size of the processor, e.g. 64 bit on x86_64. */
    Native = 'native',
    /** The pointer size of the processor, generally the same as the word size (but can be different, for example on microprocessors). */
    Pointer = 'pointer',
}
