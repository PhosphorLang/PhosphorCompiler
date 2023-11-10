import chalk from 'chalk';
import { DiagnosticCodes } from './diagnosticCodes';
import { DiagnosticMessage } from './diagnosticMessage';
import { LineInformation } from '../definitions/lineInformation';

/**
 * A diagnostic error is an error in the code that will lead to an invalid result, which means that compiling cannot
 * completely finnish.
 */
export class DiagnosticError extends DiagnosticMessage
{
    constructor (text: string, code: DiagnosticCodes, lineInformation?: LineInformation)
    {
        const type = chalk.redBright('Error');

        super(type, code, text, lineInformation);
    }
}
