import * as Instructions from '../../common/instructions';

/**
 * A LLVM function instruction in the form of: define returnType name (parameters...)
 */
export class FunctionInstruction extends Instructions.Instruction
{
    constructor (keyword: string, returnType: string, name: string, parameters: string[])
    {
        const parameterString = '(' + parameters.join(', ') + ')';

        super(keyword, returnType, name, parameterString);

        this.renderOptions = {
            commandOperandSplitter: ' ',
            operandSplitter: ' ',
            prefix: '',
            postfix: '',
        };

    }
}
