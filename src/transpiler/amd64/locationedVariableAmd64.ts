import * as SemanticSymbols from '../../connector/semanticSymbols';
import { Register64Amd64 } from './registers/register64Amd64';

export class LocationedVariableAmd64
{
    public readonly variable: SemanticSymbols.Variable;
    public location: Register64Amd64|string;

    public get locationString (): string
    {
        // TODO: Both register and stack location must not have a fixed size but the actual type size.

        if (this.location instanceof Register64Amd64)
        {
            return this.location.bit64;
        }
        else
        {
            return `QWORD ${this.location}`;
        }
    }

    constructor (variable: SemanticSymbols.Variable, location: Register64Amd64|string)
    {
        this.variable = variable;
        this.location = location;
    }
}
