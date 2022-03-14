import * as SemanticSymbols from '../../connector/semanticSymbols';
import { RegisterAvr } from './registers/registerAvr';

export class LocationedVariableAvr
{
    public readonly variable: SemanticSymbols.Variable;
    public location: RegisterAvr[];

    public get size (): number
    {
        return this.location.length;
    }

    constructor (variable: SemanticSymbols.Variable, location: RegisterAvr[])
    {
        this.variable = variable;
        this.location = location;
    }
}
