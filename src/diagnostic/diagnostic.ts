import { DiagnosticError } from './diagnosticError';
import { DiagnosticException } from './diagnosticException';
import { DiagnosticMessage } from './diagnosticMessage';
import { DiagnosticWarning } from './diagnosticWarning';

export class Diagnostic
{
    public readonly errors: string[];
    public readonly warnings: string[];
    public readonly info: string[];

    private lastDiagnosticMessage: string;

    constructor ()
    {
        this.errors = [];
        this.warnings = [];
        this.info = [];

        this.lastDiagnosticMessage = '';
    }

    /**
     * Adds a diagnostic message to the list of diagnostics (errors, warnings etc.). \
     * @param diagnosticMessage
     */
    public add (diagnosticMessage: DiagnosticMessage): void
    {
        const message = diagnosticMessage.message;

        if (diagnosticMessage instanceof DiagnosticError)
        {
            this.errors.push(message);

            this.lastDiagnosticMessage = diagnosticMessage.message;
        }
        else if (diagnosticMessage instanceof DiagnosticWarning)
        {
            this.warnings.push(message);
        }
        else
        {
            this.info.push(message);
        }
    }

    /**
     * Throws a diagnostic message. \
     * If a diagnostic message is thrown instead of added the compilation will stop immediately. This is necessary if
     * the compiler cannot continue with the current state of the code and must end at this point.
     * @param diagnosticMessage
     * @throws DiagnosticException
     */
    public throw (diagnosticMessage: DiagnosticMessage): never
    {
        this.add(diagnosticMessage);

        throw new DiagnosticException(diagnosticMessage.message);
    }

    /**
     * End the diagnostic process. \
     * Will throw a DiagnosticException if there are errors present.
     */
    public end (): void
    {
        if (this.errors.length != 0)
        {
            throw new DiagnosticException(this.lastDiagnosticMessage);
        }
    }
}
