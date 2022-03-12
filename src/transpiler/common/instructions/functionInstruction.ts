import { Instruction } from './instruction';

export default class FunctionInstruction extends Instruction
{
    constructor (keyword: string, name: string, parameters: string[], returnType: string)
    {
        const parameterString = '(' + parameters.join(', ') + '):';

        super(keyword, name, parameterString, returnType);

        this.commandOperandSplitter = ' ';
        this.operandSplitter = ' ';
        this.postfix = '';
    }
}
