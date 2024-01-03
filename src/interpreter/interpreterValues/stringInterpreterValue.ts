import { ConstantIntermediateSymbol } from '../../lowerer/intermediateSymbols/constantIntermediateSymbol';
import { InterpreterValueBase } from './interpreterValueBase';

export class StringInterpreterValue extends InterpreterValueBase
{
    public value: string;

    constructor (constant: ConstantIntermediateSymbol)
    {
        super();

        this.value = constant.value;
    }
}