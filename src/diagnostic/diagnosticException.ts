/**
 * Thrown when the compiler cannot continue because of a fatal diagnostic message.
 */
export class DiagnosticException extends Error
{
    constructor (code: string)
    {
        super(code);
        this.name = 'DiagnosticException';
    }
}
