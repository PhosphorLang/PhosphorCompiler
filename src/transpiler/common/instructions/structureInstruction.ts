import { Instruction } from './instruction';

export class StructureInstruction extends Instruction
{
    constructor (keyword: string, name: string, parameters: string[])
    {
        const parameterString = '(' + parameters.join(', ') + ')';

        super(keyword, name, parameterString);

        this.renderOptions = {
            commandOperandSplitter: ' ',
            operandSplitter: ' ',
            prefix: '',
            postfix: '',
        };

    }
}
