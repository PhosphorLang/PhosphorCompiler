import * as Instructions from '../common/instructions';

export class BackseatLabelInstruction extends Instructions.Instruction
{
    constructor (text: string)
    {
        super(text);

        this.renderOptions = {
            commandOperandSplitter: '',
            operandSplitter: '',
            prefix: '$"',
            postfix: '":',
        };
    }
}
