/**
 * Thrown when the compiler cannot continue because of a fatal diagnostic message.
 */
export default class DiagnosticException extends Error
{
    constructor (code: string)
    {
        super(code);
        this.name = 'DiagnosticException';
    }
}
