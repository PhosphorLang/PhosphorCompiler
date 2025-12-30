import * as Instructions from '../common/instructions';
import * as Intermediates from '../../intermediateLowerer/intermediates';
import * as IntermediateSymbols from '../../intermediateLowerer/intermediateSymbols';
import * as LlvmInstructions from './llvmInstructions';
import { ArrayBuilder } from '../../utility/arrayBuilder';
import { IntermediateKind } from '../../intermediateLowerer/intermediateKind';
import { IntermediateSize } from '../../intermediateLowerer/intermediateSize';
import { IntermediateSymbolKind } from '../../intermediateLowerer/intermediateSymbolKind';
import { TextEncoder } from 'node:util';

// TODO: Some of the instructions in this transpiler still have to add quotes and commas manually. Could that situation be further improved?

export class TranspilerLlvm
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

        if (fileIntermediate.isEntryPoint)
        {
            this.instructions.push(
                new Instructions.Instruction(''), // Empty line
                // TODO: The exit function could be declared twice. How to handle that?
                new Instructions.Instruction('declare', 'void', '@Standard.System.exit', '()', 'noreturn'),
                // The start routine calls main and then exits properly:
                new LlvmInstructions.Function('define', 'void', '@_start', []),
                new Instructions.Instruction('{'),
                new Instructions.Label('entry'),
            );

            // TODO: The following is ugly; we shouldn't need to go through every function to check whether an initialisation exists:
            let hasInitialisation = false;
            for (const fileFunction of fileIntermediate.functions)
            {
                if (fileFunction.symbol.name == ':initialisation')
                {
                    hasInitialisation = true;
                    break;
                }
            }

            if (hasInitialisation)
            {
                this.instructions.push(
                    new Instructions.Instruction('call', 'void', '@":initialisation"', '()')
                );
            }

            this.instructions.push(
                new Instructions.Instruction('call', 'void', '@main', '()'),
                new Instructions.Instruction('call', 'void', '@Standard.System.exit', '()'),
                new Instructions.Instruction('ret', 'void'),
                new Instructions.Instruction('}'),
            );
        }

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

    private getLlvmVariableName (intermediateSymbol: IntermediateSymbols.WritableValue): string
    {
        switch (intermediateSymbol.kind)
        {
            case IntermediateSymbolKind.LocalVariable:
                return this.getLlvmLocalName(intermediateSymbol);
            case IntermediateSymbolKind.GlobalVariable:
                return this.getLlvmGlobalName(intermediateSymbol);
        }
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
    private loadIntoRegister (variable: IntermediateSymbols.WritableValue): string
    {
        const registerName = this.nextVariableName;

        const fromVariableName = this.getLlvmVariableName(variable);
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
    private storeIntoVariable (fromString: string, variable: IntermediateSymbols.WritableValue): void
    {
        this.instructions.push(
            new Instructions.Instruction(
                'store',
                this.getLlvmSizeString(variable.size),
                fromString + ',',
                this.pointerSizeString,
                this.getLlvmVariableName(variable),
            )
        );
    }

    private getElementPointerStringForStructure (
        structure: IntermediateSymbols.Structure,
        thisReference: IntermediateSymbols.WritableValue,
        fieldIndex: number
    ): string
    {
        const baseType = this.getLlvmLocalName(structure);
        const pointerType = this.getLlvmSizeString(IntermediateSize.Pointer);
        const basePointer = this.loadIntoRegister(thisReference);
        const byteSize = this.getLlvmSizeString(IntermediateSize.Int32);

        const fromString = `getelementptr ${baseType}, ${pointerType} ${basePointer}, ${byteSize} 0, ${byteSize} ${fieldIndex}`;

        return fromString;
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

        for (const global of fileIntermediate.globals)
        {
            this.transpileGlobal(global);
        }

        if (fileIntermediate.globals.length > 0)
        {
            this.instructions.push(
                new Instructions.Instruction('') // Empty line
            );
        }

        if (fileIntermediate.structure !== null)
        {
            this.transpileStructure(fileIntermediate.structure);

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

    private transpileGlobal (globalIntermediate: Intermediates.Global): void
    {
        const instruction = new LlvmInstructions.Assignment(
            this.getLlvmGlobalName(globalIntermediate.symbol),
            'global',
            this.getLlvmSizeString(globalIntermediate.symbol.size),
            'zeroinitializer',
        );

        this.instructions.push(instruction);
    }

    private transpileStructure (structureIntermediate: Intermediates.Structure): void
    {
        const fieldSizeStrings: string[] = [];
        for (const field of structureIntermediate.symbol.fields)
        {
            const fieldSizeString = this.getLlvmSizeString(field.size);
            fieldSizeStrings.push(fieldSizeString);
        }

        const fieldsString = '{' + fieldSizeStrings.join(', ') + '}';

        const instruction = new LlvmInstructions.Assignment(
            this.getLlvmLocalName(structureIntermediate.symbol),
            'type',
            fieldsString
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

        const returnSizeString = this.getLlvmSizeString(functionIntermediate.symbol.returnSize);

        const instruction = new LlvmInstructions.Function(
            'define',
            returnSizeString,
            this.getLlvmGlobalName(functionIntermediate.symbol),
            parameterStrings,
        );

        if (functionIntermediate.symbol.returnSize !== IntermediateSize.Void)
        {
            // Allocate the return value for it being multi-assignable:
            this.variableIntroductions.push(
                new LlvmInstructions.Assignment(
                    this.getLlvmReturnName(0),
                    'alloca',
                    returnSizeString,
                )
            );
        }

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
            case IntermediateKind.And:
                this.transpileAnd(statementIntermediate);
                break;
            case IntermediateKind.Call:
                this.transpileCall(statementIntermediate);
                break;
            case IntermediateKind.Compare:
                this.transpileCompare(statementIntermediate);
                break;
            case IntermediateKind.Divide:
                this.transpileDivide(statementIntermediate);
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
            case IntermediateKind.JumpIfNotEqual:
                this.transpileJumpIfNotEqual(statementIntermediate);
                break;
            case IntermediateKind.Label:
                this.transpileLabel(statementIntermediate);
                break;
            case IntermediateKind.LoadField:
                this.transpileLoadField(statementIntermediate);
                break;
            case IntermediateKind.Modulo:
                this.transpileModulo(statementIntermediate);
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
            case IntermediateKind.Not:
                this.transpileNot(statementIntermediate);
                break;
            case IntermediateKind.Or:
                this.transpileOr(statementIntermediate);
                break;
            case IntermediateKind.Return:
                this.transpileReturn();
                break;
            case IntermediateKind.SizeOf:
                this.transpileSizeOf(statementIntermediate);
                break;
            case IntermediateKind.StoreField:
                this.transpileStoreField(statementIntermediate);
                break;
            case IntermediateKind.Subtract:
                this.transpileSubtract(statementIntermediate);
                break;
            case IntermediateKind.Take:
                this.transpileTake(statementIntermediate);
                break;
        }
    }

    private transpileSizeOf (sizeOfIntermediate: Intermediates.SizeOf): void
    {
        // NOTE: The SizeOfExpression in LLVM is a trick.
        // By utilising the getelementptr instruction, we can get the size of a type:
        // %sizePointer = getelementptr (%MyType, ptr null, i8 1)
        // %size = ptrtoint ptr %sizePointer to ToSize
        // It is quaranteed to be optimised away into a constant by the LLVM compiler.

        const structureTypeString = this.getLlvmLocalName(sizeOfIntermediate.structure);
        const pointerType = this.getLlvmSizeString(IntermediateSize.Pointer);
        const byteSizeString = this.getLlvmSizeString(IntermediateSize.Int8);

        const fromString = `getelementptr ${structureTypeString}, ${pointerType} null, ${byteSizeString} 1`;

        const sizePointerRegister = this.nextVariableName;
        const sizeRegister = this.nextVariableName;

        this.instructions.push(
            new LlvmInstructions.Assignment(sizePointerRegister, fromString),
            new LlvmInstructions.Assignment(
                sizeRegister,
                'ptrtoint',
                pointerType,
                sizePointerRegister,
                'to',
                this.getLlvmSizeString(sizeOfIntermediate.to.size),
            ),
        );

        this.storeIntoVariable(sizeRegister, sizeOfIntermediate.to);
    }

    private transpileAdd (addIntermediate: Intermediates.Add): void
    {
        // TODO: These typical two operand operations all share a lot of code. Could that be unified?

        const leftOperandRegister = this.loadIntoRegister(addIntermediate.leftOperand);
        const rightOperandRegister = this.loadIntoRegister(addIntermediate.rightOperand);
        const resultRegister = this.nextVariableName;

        // We can assume that the right value fits into the left one (the target):
        const sizeString = this.getLlvmSizeString(addIntermediate.leftOperand.size);

        this.instructions.push(
            new LlvmInstructions.Assignment(resultRegister, 'add', sizeString, leftOperandRegister + ',', rightOperandRegister),
        );

        this.storeIntoVariable(resultRegister, addIntermediate.leftOperand);
    }

    private transpileAnd (andIntermediate: Intermediates.And): void
    {
        const leftOperandRegister = this.loadIntoRegister(andIntermediate.leftOperand);
        const rightOperandRegister = this.loadIntoRegister(andIntermediate.rightOperand);
        const resultRegister = this.nextVariableName;

        // We can assume that the right value fits into the left one (the target):
        const sizeString = this.getLlvmSizeString(andIntermediate.leftOperand.size);

        this.instructions.push(
            new LlvmInstructions.Assignment(resultRegister, 'and', sizeString, leftOperandRegister + ',', rightOperandRegister),
        );

        this.storeIntoVariable(resultRegister, andIntermediate.leftOperand);
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
                    this.getLlvmGlobalName(callIntermediate.functionSymbol),
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

    private transpileDivide (divideIntermediate: Intermediates.Divide): void
    {
        const leftOperandRegister = this.loadIntoRegister(divideIntermediate.leftOperand);
        const rightOperandRegister = this.loadIntoRegister(divideIntermediate.rightOperand);
        const resultRegister = this.nextVariableName;

        // We can assume that the right value fits into the left one (the target):
        const sizeString = this.getLlvmSizeString(divideIntermediate.leftOperand.size);

        this.instructions.push(
            // TODO: We have to check the type as soon as there are unsigned types in Phosphor:
            new LlvmInstructions.Assignment(resultRegister, 'sdiv', sizeString, leftOperandRegister + ',', rightOperandRegister),
        );

        this.storeIntoVariable(resultRegister, divideIntermediate.leftOperand);
    }

    private transpileGive (giveIntermediate: Intermediates.Give): void
    {
        const registerName = this.nextVariableName;
        const targetSizeString = this.getLlvmSizeString(giveIntermediate.targetSymbol.size);

        this.instructions.push(
            new LlvmInstructions.Assignment(
                registerName,
                'load',
                targetSizeString + ',',
                this.pointerSizeString,
                this.getLlvmVariableName(giveIntermediate.variable),
            ),
        );

        switch (giveIntermediate.targetSymbol.kind)
        {
            case IntermediateSymbolKind.Parameter:
                this.outgoingParameterIndexToName.set(giveIntermediate.targetSymbol.index, registerName);
                break;
            case IntermediateSymbolKind.ReturnValue:
            {
                const targetName = this.getLlvmReturnName(giveIntermediate.targetSymbol.index);

                this.instructions.push(
                    new Instructions.Instruction(
                        'store',
                        targetSizeString,
                        registerName + ',',
                        this.pointerSizeString,
                        targetName,
                    )
                );

                break;
            }
        }
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
                this.getLlvmVariableName(introduceIntermediate.variableSymbol),
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
        // TODO: We have to check the type as soon as there are unsigned types in Phosphor:
        this.transpileConditionalJump('sgt', jumpIfGreaterIntermediate.target);
    }

    private transpileJumpIfLess (jumpIfLessIntermediate: Intermediates.JumpIfLess): void
    {
        // TODO: We have to check the type as soon as there are unsigned types in Phosphor:
        this.transpileConditionalJump('slt', jumpIfLessIntermediate.target);
    }

    private transpileJumpIfNotEqual (jumpIfNotEqualIntermediate: Intermediates.JumpIfNotEqual): void
    {
        this.transpileConditionalJump('ne', jumpIfNotEqualIntermediate.target);
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

        // If the last instruction is anything other than a branch instruction, we must close the basic block first before we can add a
        // label (especially if the instruction is already a label). The easy workaround is to add a jump instruction to our new label
        // which can be optimised away by the LLVM compiler.
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

    private transpileLoadField (loadFieldIntermediate: Intermediates.LoadField): void
    {
        const fieldPointerRegister = this.nextVariableName;

        const fromString = this.getElementPointerStringForStructure(
            loadFieldIntermediate.structure,
            loadFieldIntermediate.thisReference,
            loadFieldIntermediate.field.index
        );

        this.instructions.push(
            new LlvmInstructions.Assignment(fieldPointerRegister, fromString),
        );

        const fieldValueRegister = this.nextVariableName;

        this.instructions.push(
            new LlvmInstructions.Assignment(
                fieldValueRegister,
                'load',
                this.getLlvmSizeString(loadFieldIntermediate.field.size) + ',',
                this.pointerSizeString,
                fieldPointerRegister,
            ),
        );

        this.storeIntoVariable(fieldValueRegister, loadFieldIntermediate.to);
    }

    private transpileStoreField (storeFieldIntermediate: Intermediates.StoreField): void
    {
        const fieldPointerRegister = this.nextVariableName;

        const fromString = this.getElementPointerStringForStructure(
            storeFieldIntermediate.structure,
            storeFieldIntermediate.thisReference,
            storeFieldIntermediate.field.index
        );

        this.instructions.push(
            new LlvmInstructions.Assignment(fieldPointerRegister, fromString),
        );

        const temporaryRegister = this.loadIntoRegister(storeFieldIntermediate.from);

        this.instructions.push(
            new Instructions.Instruction(
                'store',
                this.getLlvmSizeString(storeFieldIntermediate.from.size),
                temporaryRegister + ',',
                this.pointerSizeString,
                fieldPointerRegister,
            )
        );

    }

    private transpileModulo (moduloIntermediate: Intermediates.Modulo): void
    {
        const leftOperandRegister = this.loadIntoRegister(moduloIntermediate.leftOperand);
        const rightOperandRegister = this.loadIntoRegister(moduloIntermediate.rightOperand);
        const resultRegister = this.nextVariableName;

        // We can assume that the right value fits into the left one (the target):
        const sizeString = this.getLlvmSizeString(moduloIntermediate.leftOperand.size);

        this.instructions.push(
            // TODO: We have to check the type as soon as there are unsigned types in Phosphor:
            new LlvmInstructions.Assignment(resultRegister, 'srem', sizeString, leftOperandRegister + ',', rightOperandRegister),
        );

        this.storeIntoVariable(resultRegister, moduloIntermediate.leftOperand);
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
            case IntermediateSymbolKind.LocalVariable:
            case IntermediateSymbolKind.GlobalVariable:
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

    private transpileNot (notIntermediate: Intermediates.Not): void
    {
        const operandRegister = this.loadIntoRegister(notIntermediate.operand);
        const targetName = this.nextVariableName;

        const sizeString = this.getLlvmSizeString(notIntermediate.operand.size);

        // Not in LLVM IR is done by XORing the value with -1:
        this.instructions.push(
            new LlvmInstructions.Assignment(targetName, 'xor', sizeString, operandRegister + ',', '-1'),
        );

        this.storeIntoVariable(targetName, notIntermediate.operand);
    }

    private transpileOr (orIntermediate: Intermediates.Or): void
    {
        const leftOperandRegister = this.loadIntoRegister(orIntermediate.leftOperand);
        const rightOperandRegister = this.loadIntoRegister(orIntermediate.rightOperand);
        const resultRegister = this.nextVariableName;

        // We can assume that the right value fits into the left one (the target):
        const sizeString = this.getLlvmSizeString(orIntermediate.leftOperand.size);

        this.instructions.push(
            new LlvmInstructions.Assignment(resultRegister, 'or', sizeString, leftOperandRegister + ',', rightOperandRegister),
        );

        this.storeIntoVariable(resultRegister, orIntermediate.leftOperand);
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
            const returnVariableName = this.getLlvmReturnName(0);
            const returnRegister = this.nextVariableName;

            this.instructions.push(
                new LlvmInstructions.Assignment(
                    returnRegister,
                    'load',
                    returnSizeString + ',',
                    this.pointerSizeString,
                    returnVariableName,
                ),
            );

            this.instructions.push(
                new Instructions.Instruction('ret', returnSizeString, returnRegister),
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

        this.storeIntoVariable(takeableName, takeIntermediate.variableSymbol);
    }
}
