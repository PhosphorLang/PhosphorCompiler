import * as Instructions from '../common/instructions';
import * as Intermediates from '../../lowerer/intermediates';
import * as IntermediateSymbols from '../../lowerer/intermediateSymbols';
import * as LlvmInstructions from './llvmInstructions';
import { ArrayBuilder } from '../../utility/arrayBuilder';
import { IntermediateKind } from '../../lowerer/intermediateKind';
import { IntermediateSize } from '../../lowerer/intermediateSize';
import { IntermediateSymbolKind } from '../../lowerer/intermediateSymbolKind';
import { TextEncoder } from 'node:util';
import { Transpiler } from '../transpiler';

// TODO: Some of the instructions in this transpiler still have to add quotes and commas manually. Could that situation be further improved?

export class TranspilerLlvm implements Transpiler
{
    private readonly pointerSizeString = this.getLlvmSizeString(IntermediateSize.Pointer);

    private instructions: ArrayBuilder<Instructions.Instruction>;

    /** Counter for temporary variables. */
    private variableCounter: number; // TODO: Should "variable" renamed into "register"?
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
        return `"${this.labelCounter}l"`;
    }

    private outgoingParameterIndexToName: Map<number, string>;
    private incomingReturnName: string|null;

    private variableIntroductions: Instructions.Instruction[];

    private currentFunction: IntermediateSymbols.Function | null;
    private compareOperands: [leftOperand: IntermediateSymbols.Variable, rightOperand: IntermediateSymbols.Variable] | null;

    constructor ()
    {
        this.instructions = new ArrayBuilder();

        this.variableCounter = -1;
        this.labelCounter = -1;

        this.outgoingParameterIndexToName = new Map();
        this.incomingReturnName = null;

        this.variableIntroductions = [];

        this.currentFunction = null;
        this.compareOperands = null;
    }

    public run (fileIntermediate: Intermediates.File): string
    {
        this.instructions.clear();

        this.transpileFile(fileIntermediate);

        this.instructions.push(
            new Instructions.Instruction(''), // Empty line
            new Instructions.Instruction('declare', 'void', '@exit', '()', 'noreturn'),
            // The start routine calls main and then exits properly:
            new LlvmInstructions.Function('define', 'void', '@_start', []),
            new Instructions.Instruction('{'),
            new Instructions.Label('entry'),
            new Instructions.Instruction('call', 'void', '@main', '()'),
            new Instructions.Instruction('call', 'void', '@exit', '()'),
            new Instructions.Instruction('ret', 'void'),
            new Instructions.Instruction('}'),
        );

        const fileText = this.convertInstructionsToText(this.instructions.toArray());

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

    private getLlvmName (intermediateSymbol: IntermediateSymbols.IntermediateSymbol): string
    {
        return '"' + intermediateSymbol.name + '"';
    }

    private getLlvmLocalName (intermediateSymbol: IntermediateSymbols.IntermediateSymbol): string
    {
        return '%' + this.getLlvmName(intermediateSymbol);
    }

    private getLlvmGlobalName (intermediateSymbol: IntermediateSymbols.IntermediateSymbol): string
    {
        return '@' + this.getLlvmName(intermediateSymbol);
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

    /**
     * Load a variable into a register.
     * @param variable The variable to load from.
     * @returns The name of the register.
     */
    private loadIntoRegister (variable: IntermediateSymbols.Variable): string
    {
        const registerName = this.nextVariableName;

        const fromVariableName = this.getLlvmLocalName(variable);
        const fromSizeString = this.getLlvmSizeString(variable.size);

        this.instructions.push(
            new LlvmInstructions.Assignment(
                registerName,
                'load',
                fromSizeString + ',',
                this.pointerSizeString,
                fromVariableName,
            ),
        );

        return registerName;
    }

    /**
     * Store into the given variable. \
     * NOTE: Assumes that the {@link fromString} is of the same size/type as the variable.
     * @param fromString The string that describes the value to store (e.g. a register name).
     * @param variable The variable to store into.
     */
    private storeIntoVariable (fromString: string, variable: IntermediateSymbols.Variable): void
    {
        this.instructions.push(
            new Instructions.Instruction(
                'store',
                this.getLlvmSizeString(variable.size),
                fromString + ',',
                this.pointerSizeString,
                this.getLlvmLocalName(variable),
            )
        );
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
            this.getLlvmGlobalName(constantIntermediate.symbol),
            'constant',
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
            this.getLlvmGlobalName(externalIntermediate.symbol),
            parameters,
        );

        this.instructions.push(instruction);
    }

    private transpileFunction (functionIntermediate: Intermediates.Function): void
    {
        this.variableCounter = -1;
        this.labelCounter = -1;
        this.outgoingParameterIndexToName = new Map();
        this.incomingReturnName = null;
        this.variableIntroductions = [];
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
            this.getLlvmGlobalName(functionIntermediate.symbol),
            parameterStrings,
        );

        this.instructions.push(
            instruction,
            new Instructions.Instruction('{'),
        );

        this.instructions.push(
            new Instructions.Label('entry'),
        );

        const introductionReference = this.instructions.currentReference;
        this.instructions.addNewReference();

        for (const instruction of functionIntermediate.body)
        {
            this.transpileStatement(instruction);
        }

        this.instructions.push(
            new Instructions.Instruction('}'),
        );

        introductionReference.push(...this.variableIntroductions);

        this.variableCounter = -1;
        this.labelCounter = -1;
        this.outgoingParameterIndexToName = new Map();
        this.incomingReturnName = null;
        this.variableIntroductions = [];
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
        const leftOperandName = this.getLlvmLocalName(addIntermediate.leftOperand);
        const rightOperandName = this.getLlvmLocalName(addIntermediate.rightOperand);

        // We can assume that the right value fits into the left one (the target):
        const sizeString = this.getLlvmSizeString(addIntermediate.leftOperand.size);

        this.instructions.push(
            new LlvmInstructions.Assignment(leftOperandName, 'add', sizeString, leftOperandName + ',', rightOperandName),
        );
    }

    private transpileCall (callIntermediate: Intermediates.Call): void
    {
        const parameterStrings: string[] = [];
        for (let parameterIndex = 0; parameterIndex < callIntermediate.functionSymbol.parameters.length; parameterIndex++)
        {
            const parameterSize = callIntermediate.functionSymbol.parameters[parameterIndex];
            const parameterSizeString = this.getLlvmSizeString(parameterSize);

            const parameterName = this.outgoingParameterIndexToName.get(parameterIndex);
            if (parameterName === undefined)
            {
                throw new Error('Transpiler error: Cannot call function because a parameter is not introduced.');
            }

            const parameterString = parameterSizeString + ' ' + parameterName;

            parameterStrings.push(parameterString);
        }
        this.outgoingParameterIndexToName.clear();

        // TODO: The following is duplicate code with AssignmentInstruction.constructor. Could this be unified?
        const parameterString = '(' + parameterStrings.join(', ') + ')';

        if (callIntermediate.functionSymbol.returnSize === IntermediateSize.Void)
        {
            this.instructions.push(
                new Instructions.Instruction(
                    'call',
                    this.getLlvmSizeString(callIntermediate.functionSymbol.returnSize),
                    this.getLlvmGlobalName(callIntermediate.functionSymbol),
                    parameterString,
                )
            );
        }
        else
        {
            const returnName = this.nextVariableName;
            this.incomingReturnName = returnName;

            this.instructions.push(
                new LlvmInstructions.Assignment(
                    returnName,
                    'call',
                    this.getLlvmSizeString(callIntermediate.functionSymbol.returnSize),
                    this.getLlvmLocalName(callIntermediate.functionSymbol),
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
        let targetName: string;

        switch (giveIntermediate.targetSymbol.kind)
        {
            case IntermediateSymbolKind.Parameter:
                targetName = this.nextVariableName;
                this.outgoingParameterIndexToName.set(giveIntermediate.targetSymbol.index, targetName);
                break;
            case IntermediateSymbolKind.ReturnValue:
                targetName = this.getLlvmReturnName(giveIntermediate.targetSymbol.index);
                break;
        }

        this.instructions.push(
            new LlvmInstructions.Assignment(
                targetName,
                'load',
                this.getLlvmSizeString(giveIntermediate.targetSymbol.size) + ',',
                this.pointerSizeString,
                this.getLlvmLocalName(giveIntermediate.variable),
            ),
        );
    }

    private transpileGoto (gotoIntermediate: Intermediates.Goto): void
    {
        this.instructions.push(
            new LlvmInstructions.Branch(this.getLlvmName(gotoIntermediate.target)),
        );

        // TODO: Is it really guaranteed that there is in all cases a label behind a goto instruction?
    }

    private transpileIntroduce (introduceIntermediate: Intermediates.Introduce): void
    {
        this.variableIntroductions.push(
            new LlvmInstructions.Assignment(
                this.getLlvmLocalName(introduceIntermediate.variableSymbol),
                'alloca',
                this.getLlvmSizeString(introduceIntermediate.variableSymbol.size),
            )
        );
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

        const leftOperandName = this.loadIntoRegister(leftOperand);
        const rightOperandName = this.loadIntoRegister(rightOperand);

        this.instructions.push(
            new LlvmInstructions.Assignment(
                comparisonVariableName,
                'icmp',
                condition,
                sizeName,
                leftOperandName + ',',
                rightOperandName,
            )
        );

        const falseLabelName = this.nextLabelName;

        this.instructions.push(
            new LlvmInstructions.Branch(
                comparisonVariableName,
                this.getLlvmName(target),
                falseLabelName
            )
        );

        // We need an additional label after the conditional jump to fullfil LLVM's basic block requirements:
        this.instructions.push(
            new Instructions.Label(falseLabelName),
        );

        this.compareOperands = null;
    }

    private transpileLabel (labelIntermediate: Intermediates.Label): void
    {
        const labelName = this.getLlvmName(labelIntermediate.symbol);

        // If the last instruction is anythin other than a branch instruction, we must close the basic block first before we can add a label
        // (especially if the instruction is already a label). The easy workaround is to add a jump instruction to our new label which can
        // be optimised away by the LLVM compiler.
        // TODO: Is there a better and cleaner way to do this?
        if (!(this.instructions.lastElement instanceof LlvmInstructions.Branch))
        {
            this.instructions.push(
                new LlvmInstructions.Branch(labelName),
            );
        }

        this.instructions.push(
            new Instructions.Label(labelName),
        );
    }

    private transpileMove (moveIntermediate: Intermediates.Move): void
    {
        switch (moveIntermediate.from.kind)
        {
            case IntermediateSymbolKind.Constant:
            {
                const constantName = this.getLlvmGlobalName(moveIntermediate.from);
                const constantSizeString = this.getLlvmSizeString(moveIntermediate.from.size);
                const byteSizeString = this.getLlvmSizeString(IntermediateSize.Int8);

                const fromString = `getelementptr (${byteSizeString}, ${constantSizeString} ${constantName}, ${byteSizeString} 0)`;
                this.storeIntoVariable(fromString, moveIntermediate.to);

                break;
            }
            case IntermediateSymbolKind.Variable:
            {
                const temporaryRegister = this.loadIntoRegister(moveIntermediate.from);
                this.storeIntoVariable(temporaryRegister, moveIntermediate.to);

                break;
            }
            case IntermediateSymbolKind.Literal:
            {
                // We can assume that the literal value fits into the target size:
                this.storeIntoVariable(moveIntermediate.from.value, moveIntermediate.to);

                break;
            }
        }
    }

    private transpileMultiply (multiplyIntermediate: Intermediates.Multiply): void
    {
        const leftOperandRegister = this.loadIntoRegister(multiplyIntermediate.leftOperand);
        const rightOperandRegister = this.loadIntoRegister(multiplyIntermediate.rightOperand);
        const resultRegister = this.nextVariableName;

        // TODO: What about the full product with double size an how to handle possible overflows?
        const sizeString = this.getLlvmSizeString(multiplyIntermediate.leftOperand.size);

        this.instructions.push(
            new LlvmInstructions.Assignment(resultRegister, 'mul', sizeString, leftOperandRegister + ',', rightOperandRegister),
        );

        this.storeIntoVariable(resultRegister, multiplyIntermediate.leftOperand);
    }

    private transpileNegate (negateIntermediate: Intermediates.Negate): void
    {
        const operandRegister = this.loadIntoRegister(negateIntermediate.operand);
        const targetName = this.nextVariableName;

        const sizeString = this.getLlvmSizeString(negateIntermediate.operand.size);

        // Negate in LLVM IR is done by subtracting the value from zero:
        this.instructions.push(
            new LlvmInstructions.Assignment(targetName, 'sub', sizeString, '0,', operandRegister),
        );

        this.storeIntoVariable(targetName, negateIntermediate.operand);
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
            const returnName = this.getLlvmReturnName(0);

            this.instructions.push(
                new Instructions.Instruction('ret', returnSizeString, returnName),
            );
        }
    }

    private transpileSubtract (subtractIntermediate: Intermediates.Subtract): void
    {
        const leftOperandName = this.loadIntoRegister(subtractIntermediate.leftOperand);
        const rightOperandName = this.loadIntoRegister(subtractIntermediate.rightOperand);
        const targetName = this.nextVariableName;

        // We can assume that the right value fits into the left one (the target):
        const sizeString = this.getLlvmSizeString(subtractIntermediate.leftOperand.size);

        this.instructions.push(
            new LlvmInstructions.Assignment(targetName, 'sub', sizeString, leftOperandName + ',', rightOperandName),
        );

        this.storeIntoVariable(targetName, subtractIntermediate.leftOperand);
    }

    private transpileTake (takeIntermediate: Intermediates.Take): void
    {
        let takeableName: string;
        switch (takeIntermediate.takableValue.kind)
        {
            case IntermediateSymbolKind.Parameter:
                takeableName = this.getLlvmParameterName(takeIntermediate.takableValue.index);
                break;
            case IntermediateSymbolKind.ReturnValue:
                if (this.incomingReturnName === null)
                {
                    throw new Error('Transpiler error: Tried to take from an unknown return value.');
                }
                takeableName = this.incomingReturnName;
                this.incomingReturnName = null;
                break;
        }

        this.variableIntroductions.push(
            new LlvmInstructions.Assignment(
                takeableName,
                'alloca',
                this.getLlvmSizeString(takeIntermediate.takableValue.size),
            )
        );

        this.storeIntoVariable(takeableName, takeIntermediate.variableSymbol);
    }
}
