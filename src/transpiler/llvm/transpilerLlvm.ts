import * as Instructions from '../common/instructions';
import * as Intermediates from '../../lowerer/intermediates';
import * as IntermediateSymbols from '../../lowerer/intermediateSymbols';
import * as LlvmInstructions from './llvmInstructions';
import { IntermediateKind } from '../../lowerer/intermediateKind';
import { IntermediateSize } from '../../lowerer/intermediateSize';
import { IntermediateSymbolKind } from '../../lowerer/intermediateSymbolKind';
import { TextEncoder } from 'node:util';
import { Transpiler } from '../transpiler';

export class TranspilerLlvm implements Transpiler
{
    private instructions: Instructions.Instruction[];

    /** Counter for variables as all variables/registers in LLVM must only be assigned to once. */
    private variableCounter: number;
    private get nextVariableName (): string
    {
        this.variableCounter++;
        return `%"${this.variableCounter}v"`;
    }

    /** Label counter for the generation of basic blocks as required by LLVM. */
    private labelCounter: number;
    private get nextLabelName (): string
    {
        this.labelCounter++;
        return `${this.labelCounter}l`;
    }

    /** Map of intermediate variables (their indices) to their LLVM variable/register name. */
    private intermediateVariableIndexToNameMap: Map<number, string>;
    /** Map of intermediate parameters (their indices) to their LLVM variable/register name. */
    private intermediateParameterIndexToNameMap: Map<number, string>;
    /** Map of intermediate returns (their indices) to their LLVM variable/register name. */
    private intermediateReturnIndexToNameMap: Map<number, string>;

    private currentFunction: IntermediateSymbols.Function | null;
    private compareOperands: [leftOperand: IntermediateSymbols.Variable, rightOperand: IntermediateSymbols.Variable] | null;

    constructor ()
    {
        this.instructions = [];

        this.variableCounter = -1;
        this.labelCounter = -1;

        this.intermediateVariableIndexToNameMap = new Map();
        this.intermediateParameterIndexToNameMap = new Map();
        this.intermediateReturnIndexToNameMap = new Map();

        this.currentFunction = null;
        this.compareOperands = null;
    }

    public run (fileIntermediate: Intermediates.File): string
    {
        this.instructions = [];

        this.transpileFile(fileIntermediate);

        const fileText = this.convertInstructionsToText(this.instructions);

        return fileText;
    }

    private convertInstructionsToText (instructions: Instructions.Instruction[]): string
    {
        let text = '';
        let indentation = '';

        for (const instruction of instructions)
        {
            if (instruction.command == '}')
            {
                indentation = indentation.slice(4);
            }

            const renderOptions: Instructions.RenderOptions = {
                commandOperandSplitter: ' ',
                operandSplitter: ' ',
                prefix: '',
                postfix: '',
            };

            text += instruction.render(renderOptions, indentation) + '\n';

            if (instruction.command == '{')
            {
                indentation += '    ';
            }
        }

        return text;
    }

    private getLlvmParameterName (index: number): string
    {
        return `%"${index}p"`;
    }

    private getLlvmReturnName (index: number): string
    {
        return `%"${index}r"`;
    }

    private getLlvmLocalEscapedName (intermediateSymbol: IntermediateSymbols.IntermediateSymbol): string
    {
        // TODO: The quotes around the name allow all characters to be used in the name. Is there a better way than adding them here?
        return '@"' + intermediateSymbol.name + '"';
    }

    private getLlvmLabelName (labelSymbol: IntermediateSymbols.Label): string
    {
        // TODO: The quotes around the name allow all characters to be used in the name. Is there a better way than adding them here?
        return '"' + labelSymbol.name + '"';
    }

    private getLlvmSizeString (intermediateSize: IntermediateSize): string
    {
        switch (intermediateSize)
        {
            case IntermediateSize.Int8:
                return 'i8';
            case IntermediateSize.Int16:
                return 'i16';
            case IntermediateSize.Int32:
                return 'i32';
            case IntermediateSize.Int64:
                return 'i64';
            case IntermediateSize.Native:
                return 'i64'; // FIXME: Input actual target word size.
            case IntermediateSize.Pointer:
                return 'ptr';
            case IntermediateSize.Void:
                return 'void';
        }
    }

    private transpileFile (fileIntermediate: Intermediates.File): void
    {
        for (const constant of fileIntermediate.constants)
        {
            this.transpileConstant(constant);
        }

        if (fileIntermediate.constants.length > 0)
        {
            this.instructions.push(
                new Instructions.Instruction('') // Empty line
            );
        }

        for (const external of fileIntermediate.externals)
        {
            this.transpileExternal(external);
        }

        if (fileIntermediate.externals.length > 0)
        {
            this.instructions.push(
                new Instructions.Instruction('') // Empty line
            );
        }

        for (const functionNode of fileIntermediate.functions)
        {
            this.transpileFunction(functionNode);

            if (functionNode !== fileIntermediate.functions.at(-1))
            {
                this.instructions.push(
                    new Instructions.Instruction('') // Empty line
                );
            }
        }
    }

    private transpileConstant (constantIntermediate: Intermediates.Constant): void
    {
        // TODO: This assumes that constants are always strings. Must be adjusted as soon as constants get a type (other than string only).

        // We need an encoded string to get the real byte count:
        const encoder = new TextEncoder();
        const encodedString = encoder.encode(constantIntermediate.symbol.value);

        const stringByteCount = encodedString.length;

        const byteType = this.getLlvmSizeString(IntermediateSize.Int8);
        const nativeType = this.getLlvmSizeString(IntermediateSize.Native);

        const constantTypeString = `${nativeType}, [${stringByteCount} x ${byteType}]`;
        const constantValueString =
            `${nativeType} ${stringByteCount}, [${stringByteCount} x ${byteType}] c"${constantIntermediate.symbol.value}"`;

        const instruction = new LlvmInstructions.Assignment(
            this.getLlvmLocalEscapedName(constantIntermediate.symbol),
            'global',
            '{' + constantTypeString + '}',
            '{' + constantValueString + '}'
        );

        this.instructions.push(instruction);
    }

    private transpileExternal (externalIntermediate: Intermediates.External): void
    {
        const parameters: string[] = [];

        for (const parameterSize of externalIntermediate.symbol.parameters)
        {
            const parameter = this.getLlvmSizeString(parameterSize);
            parameters.push(parameter);
        }

        const instruction = new LlvmInstructions.Function(
            'declare',
            this.getLlvmSizeString(externalIntermediate.symbol.returnSize),
            this.getLlvmLocalEscapedName(externalIntermediate.symbol),
            parameters,
        );

        this.instructions.push(instruction);
    }

    private transpileFunction (functionIntermediate: Intermediates.Function): void
    {
        this.variableCounter = -1;
        this.labelCounter = -1;
        this.intermediateVariableIndexToNameMap.clear();
        this.intermediateParameterIndexToNameMap.clear();
        this.intermediateReturnIndexToNameMap.clear();
        this.currentFunction = functionIntermediate.symbol;

        const parameterStrings: string[] = [];
        for (let parameterIndex = 0; parameterIndex < functionIntermediate.symbol.parameters.length; parameterIndex++)
        {
            const parameterSize = functionIntermediate.symbol.parameters[parameterIndex];
            const parameterSizeString = this.getLlvmSizeString(parameterSize);
            const parameterName = this.getLlvmParameterName(parameterIndex);
            const parameterString = parameterSizeString + ' ' + parameterName;

            parameterStrings.push(parameterString);
        }

        const instruction = new LlvmInstructions.Function(
            'define',
            this.getLlvmSizeString(functionIntermediate.symbol.returnSize),
            this.getLlvmLocalEscapedName(functionIntermediate.symbol),
            parameterStrings,
        );

        this.instructions.push(
            instruction,
            new Instructions.Instruction('{'),
        );

        this.instructions.push(
            new Instructions.Label('entry'),
        );

        for (const instruction of functionIntermediate.body)
        {
            this.transpileStatement(instruction);
        }

        this.instructions.push(
            new Instructions.Instruction('}'),
        );

        this.variableCounter = -1;
        this.labelCounter = -1;
        this.intermediateVariableIndexToNameMap.clear();
        this.intermediateParameterIndexToNameMap.clear();
        this.intermediateReturnIndexToNameMap.clear();
        this.currentFunction = null;
    }

    private transpileStatement (statementIntermediate: Intermediates.Statement): void
    {
        switch (statementIntermediate.kind)
        {
            case IntermediateKind.Add:
                this.transpileAdd(statementIntermediate);
                break;
            case IntermediateKind.Call:
                this.transpileCall(statementIntermediate);
                break;
            case IntermediateKind.Compare:
                this.transpileCompare(statementIntermediate);
                break;
            case IntermediateKind.Dismiss:
                // Nothing to do here.
                // Note that we could delete the variables from the map here. But then we would need to handle the dismisses between
                // a compare and jump in a special way. (Have a look at transpileCompare for more information about this.)
                break;
            case IntermediateKind.Give:
                this.transpileGive(statementIntermediate);
                break;
            case IntermediateKind.Goto:
                this.transpileGoto(statementIntermediate);
                break;
            case IntermediateKind.Introduce:
                this.transpileIntroduce(statementIntermediate);
                break;
            case IntermediateKind.JumpIfEqual:
                this.transpileJumpIfEqual(statementIntermediate);
                break;
            case IntermediateKind.JumpIfGreater:
                this.transpileJumpIfGreater(statementIntermediate);
                break;
            case IntermediateKind.JumpIfLess:
                this.transpileJumpIfLess(statementIntermediate);
                break;
            case IntermediateKind.Label:
                this.transpileLabel(statementIntermediate);
                break;
            case IntermediateKind.Move:
                this.transpileMove(statementIntermediate);
                break;
            case IntermediateKind.Multiply:
                this.transpileMultiply(statementIntermediate);
                break;
            case IntermediateKind.Negate:
                this.transpileNegate(statementIntermediate);
                break;
            case IntermediateKind.Return:
                this.transpileReturn();
                break;
            case IntermediateKind.Subtract:
                this.transpileSubtract(statementIntermediate);
                break;
            case IntermediateKind.Take:
                this.transpileTake(statementIntermediate);
                break;
        }
    }

    private transpileAdd (addIntermediate: Intermediates.Add): void
    {
        const leftOperandName = this.intermediateVariableIndexToNameMap.get(addIntermediate.leftOperand.index);
        if (leftOperandName === undefined)
        {
            throw new Error('Transpiler error: Cannot add because the left operand is not introduced.');
        }
        const rightOperandName = this.intermediateVariableIndexToNameMap.get(addIntermediate.rightOperand.index);
        if (rightOperandName === undefined)
        {
            throw new Error('Transpiler error: Cannot add because the right operand is not introduced.');
        }

        const targetName = this.nextVariableName;
        this.intermediateVariableIndexToNameMap.set(addIntermediate.leftOperand.index, targetName);

        // We can assume that the right value fits into the left one (the target):
        const sizeString = this.getLlvmSizeString(addIntermediate.leftOperand.size);

        this.instructions.push(
            new LlvmInstructions.Assignment(targetName, 'add', sizeString, leftOperandName, ',', rightOperandName),
        );
    }

    private transpileCall (callIntermediate: Intermediates.Call): void
    {
        const parameterStrings: string[] = [];
        for (let parameterIndex = 0; parameterIndex < callIntermediate.functionSymbol.parameters.length; parameterIndex++)
        {
            const parameterSize = callIntermediate.functionSymbol.parameters[parameterIndex];
            const parameterSizeString = this.getLlvmSizeString(parameterSize);

            const parameterName = this.intermediateParameterIndexToNameMap.get(parameterIndex);
            if (parameterName === undefined)
            {
                throw new Error('Transpiler error: Cannot call function because a parameter is not introduced.');
            }

            const parameterString = parameterSizeString + ' ' + parameterName;

            parameterStrings.push(parameterString);
        }
        this.intermediateParameterIndexToNameMap.clear();

        // TODO: The following is duplicate code with AssignmentInstruction.constructor. Could this be unified?
        const parameterString = '(' + parameterStrings.join(', ') + ')';

        if (callIntermediate.functionSymbol.returnSize === IntermediateSize.Void)
        {
            this.instructions.push(
                new Instructions.Instruction(
                    'call',
                    this.getLlvmSizeString(callIntermediate.functionSymbol.returnSize),
                    this.getLlvmLocalEscapedName(callIntermediate.functionSymbol),
                    parameterString,
                )
            );
        }
        else
        {
            const returnName = this.getLlvmReturnName(0);

            this.instructions.push(
                new LlvmInstructions.Assignment(
                    returnName,
                    'call',
                    this.getLlvmSizeString(callIntermediate.functionSymbol.returnSize),
                    this.getLlvmLocalEscapedName(callIntermediate.functionSymbol),
                    parameterString,
                ),
            );
        }
    }

    private transpileCompare (compareIntermediate: Intermediates.Compare): void
    {
        /* Intermediate representation:
           - compare a b
           - jumpIfEqual/jumpIfGreater etc. trueLabel
           LLVM IR:
           - %cmp = icmp equal/greater etc. a b
           - br i1 %cmp, trueLabel, falseLabel
        As we would need the condition now, we temporarily save the operands and use them later in the jump instruction.
        TODO: Could this be done better? */

        if (this.compareOperands !== null)
        {
            throw new Error('Transpiler error: Cannot compare because another compare is already in progress.');
        }

        this.compareOperands = [
            compareIntermediate.leftOperand,
            compareIntermediate.rightOperand,
        ];
    }

    private transpileGive (giveIntermediate: Intermediates.Give): void
    {
        const variableName = this.intermediateVariableIndexToNameMap.get(giveIntermediate.variable.index);
        if (variableName === undefined)
        {
            throw new Error('Transpiler error: Tried to give from a variable that was not introduced.');
        }

        switch (giveIntermediate.targetSymbol.kind)
        {
            case IntermediateSymbolKind.Parameter:
                this.intermediateParameterIndexToNameMap.set(giveIntermediate.targetSymbol.index, variableName);
                break;
            case IntermediateSymbolKind.ReturnValue:
                this.intermediateReturnIndexToNameMap.set(giveIntermediate.targetSymbol.index, variableName);
                break;
        }
    }

    private transpileGoto (gotoIntermediate: Intermediates.Goto): void
    {
        this.instructions.push(
            new Instructions.Instruction('br', 'label', this.getLlvmLabelName(gotoIntermediate.target)),
        );

        // We need an additional label after the goto to fullfil LLVM's basic block requirements:
        this.instructions.push(
            new Instructions.Label(this.nextLabelName),
        );
    }

    private transpileIntroduce (introduceIntermediate: Intermediates.Introduce): void
    {
        if (this.intermediateVariableIndexToNameMap.has(introduceIntermediate.variableSymbol.index))
        {
            throw new Error('Transpiler error: Tried to introduce a variable that was already introduced.');
        }

        const variableName = this.nextVariableName;
        this.intermediateVariableIndexToNameMap.set(introduceIntermediate.variableSymbol.index, variableName);
    }

    private transpileJumpIfEqual (jumpIfEqualIntermediate: Intermediates.JumpIfEqual): void
    {
        this.transpileConditionalJump('eq', jumpIfEqualIntermediate.target);
    }

    private transpileJumpIfGreater (jumpIfGreaterIntermediate: Intermediates.JumpIfGreater): void
    {
        // TODO: We have to check the type as soon as there are signed types in Phosphor:
        this.transpileConditionalJump('ugt', jumpIfGreaterIntermediate.target);
    }

    private transpileJumpIfLess (jumpIfLessIntermediate: Intermediates.JumpIfLess): void
    {
        // TODO: We have to check the type as soon as there are signed types in Phosphor:
        this.transpileConditionalJump('ult', jumpIfLessIntermediate.target);
    }

    private transpileConditionalJump (condition: string, target: IntermediateSymbols.Label): void
    {
        if (this.compareOperands === null)
        {
            throw new Error('Transpiler error: Cannot jump because no compare is in progress.');
        }
        const [leftOperand, rightOperand] = this.compareOperands;

        const comparisonVariableName = this.nextVariableName;
        const sizeName = this.getLlvmSizeString(leftOperand.size);

        const leftOperandName = this.intermediateVariableIndexToNameMap.get(leftOperand.index);
        if (leftOperandName === undefined)
        {
            throw new Error('Transpiler error: Tried to jump with a left operand that was not introduced.');
        }

        const rightOperandName = this.intermediateVariableIndexToNameMap.get(rightOperand.index);
        if (rightOperandName === undefined)
        {
            throw new Error('Transpiler error: Tried to jump with a right operand that was not introduced.');
        }

        this.instructions.push(
            new LlvmInstructions.Assignment(
                comparisonVariableName,
                'icmp',
                condition,
                sizeName,
                leftOperandName,
                rightOperandName,
            )
        );

        this.instructions.push(
            new Instructions.Instruction(
                'br',
                'i1',
                comparisonVariableName,
                this.getLlvmLabelName(target),
                this.nextLabelName
            )
        );

        // We need an additional label after the conditional jump to fullfil LLVM's basic block requirements:
        this.instructions.push(
            new Instructions.Label(this.nextLabelName),
        );

        this.compareOperands = null;
    }

    private transpileLabel (labelIntermediate: Intermediates.Label): void
    {
        this.instructions.push(
            new Instructions.Label(
                this.getLlvmLabelName(labelIntermediate.symbol),
            ),
        );
    }

    private transpileMove (moveIntermediate: Intermediates.Move): void
    {
        const toName = this.nextVariableName;
        this.intermediateVariableIndexToNameMap.set(moveIntermediate.to.index, toName);

        switch (moveIntermediate.from.kind)
        {
            case IntermediateSymbolKind.Constant:
            {
                const constantName = this.getLlvmLocalEscapedName(moveIntermediate.from);
                const constantSizeString = this.getLlvmSizeString(moveIntermediate.from.size);
                const byteSizeString = this.getLlvmSizeString(IntermediateSize.Int8);

                this.instructions.push(
                    new LlvmInstructions.Assignment(
                        toName,
                        'getelementptr',
                        byteSizeString + ',',
                        constantSizeString,
                        constantName + ',',
                        byteSizeString +' 0',
                    ),
                );

                break;
            }
            case IntermediateSymbolKind.Variable:
            {
                const fromTypeString = this.getLlvmSizeString(moveIntermediate.from.size);

                const fromVariableName = this.intermediateVariableIndexToNameMap.get(moveIntermediate.from.index);
                if (fromVariableName === undefined)
                {
                    throw new Error('Transpiler error: Tried to move from a variable that was not introduced.');
                }
                const fromName = fromVariableName;

                const fromString = fromTypeString + ' ' + fromName;

                this.instructions.push(
                    new LlvmInstructions.Assignment(toName, fromString),
                );

                break;
            }
            case IntermediateSymbolKind.Literal:
            {
                // We can assume that the literal value fits into the target size:
                const toSizeString = this.getLlvmSizeString(moveIntermediate.to.size);
                const literalValue = moveIntermediate.from.value;

                // HACK: There is no way in LLVM IR to put a literal value into a register, thus we need this addition hack.
                this.instructions.push(
                    new LlvmInstructions.Assignment(toName, 'add', toSizeString, literalValue, ', 0'),
                );

                break;
            }
        }
    }

    private transpileMultiply (multiplyIntermediate: Intermediates.Multiply): void
    {
        const leftOperandName = this.intermediateVariableIndexToNameMap.get(multiplyIntermediate.leftOperand.index);
        if (leftOperandName === undefined)
        {
            throw new Error('Transpiler error: Cannot multiply because the left operand is not introduced.');
        }
        const rightOperandName = this.intermediateVariableIndexToNameMap.get(multiplyIntermediate.rightOperand.index);
        if (rightOperandName === undefined)
        {
            throw new Error('Transpiler error: Cannot multiply because the right operand is not introduced.');
        }

        const targetName = this.nextVariableName;
        this.intermediateVariableIndexToNameMap.set(multiplyIntermediate.leftOperand.index, targetName);

        // TODO: What about the full product with double size an how to handle possible overflows?
        const sizeString = this.getLlvmSizeString(multiplyIntermediate.leftOperand.size);

        this.instructions.push(
            new LlvmInstructions.Assignment(targetName, 'mul', sizeString, leftOperandName, ',', rightOperandName),
        );
    }

    private transpileNegate (negateIntermediate: Intermediates.Negate): void
    {
        const operandName = this.intermediateVariableIndexToNameMap.get(negateIntermediate.operand.index);
        if (operandName === undefined)
        {
            throw new Error('Transpiler error: Cannot negate because the operand is not introduced.');
        }

        const targetName = this.nextVariableName;
        this.intermediateVariableIndexToNameMap.set(negateIntermediate.operand.index, targetName);

        const sizeString = this.getLlvmSizeString(negateIntermediate.operand.size);

        // Negate in LLVM IR is done by subtracting the value from zero:
        this.instructions.push(
            new LlvmInstructions.Assignment(targetName, 'sub', sizeString, '0,', operandName),
        );
    }

    private transpileReturn (): void
    {
        if (this.currentFunction === null)
        {
            throw new Error('Transpiler error: Tried to return from outside a function.');
        }

        // TODO: Instead of needing the "currentFunction" workaround, could the return intermediate include the function symbol?

        const returnSizeString = this.getLlvmSizeString(this.currentFunction.returnSize);

        if (this.currentFunction.returnSize == IntermediateSize.Void)
        {
            this.instructions.push(
                new Instructions.Instruction('ret', returnSizeString),
            );
        }
        else
        {
            const returnName = this.intermediateReturnIndexToNameMap.get(0);
            if (returnName === undefined)
            {
                throw new Error('Transpiler error: Tried to return a value that was not given.');
            }

            this.instructions.push(
                new Instructions.Instruction('ret', returnSizeString, returnName),
            );
        }
    }

    private transpileSubtract (subtractIntermediate: Intermediates.Subtract): void
    {
        const leftOperandName = this.intermediateVariableIndexToNameMap.get(subtractIntermediate.leftOperand.index);
        if (leftOperandName === undefined)
        {
            throw new Error('Transpiler error: Cannot subtract because the left operand is not introduced.');
        }
        const rightOperandName = this.intermediateVariableIndexToNameMap.get(subtractIntermediate.rightOperand.index);
        if (rightOperandName === undefined)
        {
            throw new Error('Transpiler error: Cannot subtract because the right operand is not introduced.');
        }

        const targetName = this.nextVariableName;
        this.intermediateVariableIndexToNameMap.set(subtractIntermediate.leftOperand.index, targetName);

        // We can assume that the right value fits into the left one (the target):
        const sizeString = this.getLlvmSizeString(subtractIntermediate.leftOperand.size);

        this.instructions.push(
            new LlvmInstructions.Assignment(targetName, 'sub', sizeString, leftOperandName, ',', rightOperandName),
        );
    }

    private transpileTake (takeIntermediate: Intermediates.Take): void
    {
        switch (takeIntermediate.takableValue.kind)
        {
            case IntermediateSymbolKind.Parameter:
            {
                const parameterName = this.getLlvmParameterName(takeIntermediate.takableValue.index);
                this.intermediateVariableIndexToNameMap.set(takeIntermediate.variableSymbol.index, parameterName);

                break;
            }
            case IntermediateSymbolKind.ReturnValue:
            {
                const returnName = this.getLlvmReturnName(takeIntermediate.takableValue.index);
                this.intermediateVariableIndexToNameMap.set(takeIntermediate.variableSymbol.index, returnName);

                break;
            }
        }
    }
}
