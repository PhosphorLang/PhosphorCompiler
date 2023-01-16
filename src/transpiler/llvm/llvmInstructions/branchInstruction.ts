import * as Instructions from '../../common/instructions';

/**
 * A LLVM branch instruction in the form of: branch label <label> or br i1 <condition>, label <trueLabel>, label <falseLabel>
 */
export class BranchInstruction extends Instructions.Instruction
{
    constructor (label: string);
    constructor (condition: string, trueLabel: string, falseLabel: string);
    constructor (conditionOrLabel: string, trueLabel?: string, falseLabel?: string)
    {
        if (trueLabel === undefined || falseLabel === undefined)
        {
            const command = 'br';

            super(command, 'label %' + conditionOrLabel);
        }
        else
        {
            const command = 'br i1';

            super(command, conditionOrLabel, 'label %' + trueLabel, 'label %' + falseLabel);
        }

        this.renderOptions = {
            commandOperandSplitter: ' ',
            operandSplitter: ', ',
            prefix: '',
            postfix: '',
        };
    }
}
