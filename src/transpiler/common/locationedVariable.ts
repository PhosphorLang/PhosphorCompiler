import * as SemanticSymbols from "../../connector/semanticSymbols";
import Register64 from "./register64";

export default class LocationedVariable
{
    public readonly variable: SemanticSymbols.Variable;
    public location: Register64|string;

    public get locationString (): string
    {
        // TODO: Both register and stack location must not have a fixed size but the actual type size.

        if (this.location instanceof Register64)
        {
            return this.location.bit64;
        }
        else
        {
            return `QWORD ${this.location}`;
        }
    }

    constructor (variable: SemanticSymbols.Variable, location: Register64|string)
    {
        this.variable = variable;
        this.location = location;
    }
}
