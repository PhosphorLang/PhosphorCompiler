import { Instruction } from './instruction';

export class FunctionInstruction extends Instruction
{
    constructor (keyword: string, name: string, parameters: string[], returnType: string)
    {
        const parameterString = '(' + parameters.join(', ') + '):';

        super(keyword, name, parameterString, returnType);

        this.renderOptions = {
            commandOperandSplitter: ' ',
            operandSplitter: ' ',
            prefix: '',
            postfix: '',
        };

    }
}
