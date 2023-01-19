export enum IntermediateSize
{
    Int8 = 'Int8',
    Int16 = 'Int16',
    Int32 = 'Int32',
    Int64 = 'Int64',
    /** The word size of the processor, e.g. 64 bit on x86_64. */
    Native = 'Native',
    /** The pointer size of the processor, generally the same as the word size (but can be different, for example on microprocessors). */
    Pointer = 'Pointer',
    /** Void is the size of "NoType", i.e. zero. */
    Void = 'Void',
    // TODO: What about unsigned types (UIntX, UNative)?
    // TODO: What about floating point types (FloatX)?
    // TODO: What about copy-by-value types (Structure, Array)?
}
