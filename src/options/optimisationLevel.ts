/**
 * The possible optimisation levels for the compiler.
 * NOTE: You can assume that the values are of type string and thus strings are castable to this enum.
 */
enum OptimisationLevel
{
    None = 'none',
    Balanced = 'balanced',
    Performance = 'performance',
    Size = 'size',
}

export default OptimisationLevel;
