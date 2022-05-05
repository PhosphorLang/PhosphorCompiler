import chalk from 'chalk';
import { DiagnosticMessage } from './diagnosticMessage';
import { LineInformation } from '../definitions/lineInformation';

/**
 * A diagnostic warning is added when a piece of code is not an error but could lead to an undetected error or may be
 * risky.
 */
export class DiagnosticWarning extends DiagnosticMessage
{
    constructor (text: string, code: string, lineInformation?: LineInformation)
    {
        const type = chalk.yellowBright('Warning');

        super(type, code, text, lineInformation);
    }
}
