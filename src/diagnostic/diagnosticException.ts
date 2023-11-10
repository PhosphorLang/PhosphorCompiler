/**
 * Thrown when the compiler cannot continue because of a fatal diagnostic message.
 */
export class DiagnosticException extends Error
{
    constructor (message: string)
    {
        super(message);
        this.name = 'DiagnosticException';
    }
}
