import { Instruction } from './instruction';

export class StructureInstruction extends Instruction
{
    constructor (keyword: string, name: string, parameters: string[])
    {
        // TODO: The formatting "string" here is a mess. This should instead be solved similar to how functions are formatted.
        const parameterString = '\n(\n    ' + parameters.join(',\n    ') + '\n)';

        super(keyword, name, parameterString);

        this.renderOptions = {
            commandOperandSplitter: ' ',
            operandSplitter: ' ',
            prefix: '',
            postfix: '',
        };
    }
}
