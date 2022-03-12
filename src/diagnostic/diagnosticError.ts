import chalk from 'chalk';
import DiagnosticMessage from './diagnosticMessage';
import LineInformation from '../definitions/lineInformation';

/**
 * A diagnostic error is an error in the code that will lead to an invalid result, which means that compiling cannot
 * completely finnish.
 */
export default class DiagnosticError extends DiagnosticMessage
{
    constructor (text: string, code: string, lineInformation: LineInformation)
    {
        const type = chalk.redBright('Error');

        super(type, code, text, lineInformation);
    }
}
