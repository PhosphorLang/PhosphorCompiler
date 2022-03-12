import DiagnosticMessage from './diagnosticMessage';
import LineInformation from '../definitions/lineInformation';

/**
 * A diagnostic error is an error in the code that will lead to an invalid result, which means that the compiling
 * cannot completely finnish.
 */
export default class DiagnosticInfo extends DiagnosticMessage
{
    constructor (text: string, code: string, lineInformation: LineInformation)
    {
        const type = 'Info';

        super(type, code, text, lineInformation);
    }
}
