export default class MissingArgumentError extends Error
{
    /**
     * An error which occures when a required command line argument is missing.
     * @param name The name of the argument, e.g. 'file path'.
     * @param argumentString The list of arguments that must be set, e.g. '"-f <path>" or "--file <path>"'
     */
    constructor (name: string, argumentString: string)
    {
        const message = `No ${name} given. Set one with ${argumentString}.`;

        super(message);
    }
}
