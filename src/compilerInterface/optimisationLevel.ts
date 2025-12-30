/**
 * The possible optimisation levels for the compiler.
 * NOTE: You can assume that the values are of type string and thus strings are castable to this enum.
 */
export enum OptimisationLevel
{
    None = 'none',
    Balanced = 'balanced',
    Performance = 'performance',
    Size = 'size',
}
// TODO: The optimisation level should be replaced or extended with optimisation flags than enable/disable certain optimisations.
