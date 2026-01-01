import * as Intermediates from '../../intermediateLowerer/intermediates';
import * as IntermediateSymbols from '../../intermediateLowerer/intermediateSymbols';
import { IntermediateKind } from '../../intermediateLowerer/intermediateKind';
import { IntermediateSize } from '../../intermediateLowerer/intermediateSize';
import { IntermediateSymbolKind } from '../../intermediateLowerer/intermediateSymbolKind';

export class TranspilerC
{
    private static readonly integerTypeName = 'Integer';
    private static readonly integer8TypeName = 'Integer8';
    private static readonly integer16TypeName = 'Integer16';
    private static readonly integer32TypeName = 'Integer32';
    private static readonly integer64TypeName = 'Integer64';
    private static readonly stringTypeName = 'String';

    private code: string[];

    /** Counter for temporary variables. */
    private variableCounter: number;
    private get nextVariableName (): string
    {
        this.variableCounter++;
        return `t_${this.variableCounter}`;
    }

    private outgoingParameterIndexToName: Map<number, string>;
    private incomingReturnName: string|null;

    private currentFunction: IntermediateSymbols.Function | null;
    private compareOperands: [leftOperand: IntermediateSymbols.Variable, rightOperand: IntermediateSymbols.Variable] | null;

    constructor ()
    {
        this.code = [
            '#include "Phosphor.Types.h"',
        ];

        this.variableCounter = -1;

        this.outgoingParameterIndexToName = new Map();
        this.incomingReturnName = null;

        this.currentFunction = null;
        this.compareOperands = null;
    }

    public run (fileIntermediate: Intermediates.File): string
    {
        this.transpileFile(fileIntermediate);

        if (fileIntermediate.isEntryPoint)
        {
            this.code.push(
                '', // Empty line
                'extern void exit () asm ("\\"Standard.System.exit\\"");',
                '', // Empty line
                'void _start ()',
                '{',
                // TODO: Handle the initialisation code here.
                'i_main();',
                'exit();',
                '}',
            );
        }

        const codeText = this.getLinesAsFormattedText(this.code);

        return codeText;
    }

    private getLinesAsFormattedText (lines: string[]): string
    {
        let text = '';
        let indentation = '';

        for (const line of lines)
        {
            if (line == '}')
            {
                indentation = indentation.slice(4);
            }

            text += indentation + line + '\n';

            if (line == '{')
            {
                indentation += '    ';
            }
        }

        return text;
    }

    private getEscapedName (originalName: string): string
    {
        let escapedName = '';

        for (const characterCodePoint of originalName)
        {
            if ((characterCodePoint >= 'a' && characterCodePoint <= 'z') ||
                (characterCodePoint >= 'A' && characterCodePoint <= 'Z') ||
                (characterCodePoint >= '0' && characterCodePoint <= '9') ||
                (characterCodePoint === '_'))
            {
                escapedName += characterCodePoint;
            }
            else
            {
                const characterCode = characterCodePoint.charCodeAt(0);
                const escapedCharacterHex = characterCode.toString(16);

                escapedName += '$' + escapedCharacterHex + '$';
            }
        }

        return escapedName;
    }

    private getIdentifierName (symbol: IntermediateSymbols.IntermediateSymbol): string
    {
        const escapedName = this.getEscapedName(symbol.name);

        return `i_${escapedName}`;
    }

    private getLabelName (labelSymbol: IntermediateSymbols.Label): string
    {
        if (!labelSymbol.name.startsWith('l#'))
        {
            // TODO: This unpleasantly depends on the naming convention for labels in the intermediate language.
            throw new Error(`Transpiler error: Invalid label name: ${labelSymbol.name}`);
        }

        const labelIndexString = labelSymbol.name.slice(2);

        return `l_${labelIndexString}`;
    }

    private getFieldName (fieldSymbol: IntermediateSymbols.Field): string
    {
        return `f_${fieldSymbol.index}`;
    }

    private getParameterName (index: number): string
    {
        return `p_${index}`;
    }

    private getReturnName (index: number): string
    {
        return `r_${index}`;
    }

    private getLocalName (localVariableSymbol: IntermediateSymbols.LocalVariable): string
    {
        return `v_${localVariableSymbol.index}`;
    }

    private getVariableName (writableSymbol: IntermediateSymbols.WritableValue): string
    {
        switch (writableSymbol.kind)
        {
            case IntermediateSymbolKind.LocalVariable:
                return this.getLocalName(writableSymbol);
            case IntermediateSymbolKind.GlobalVariable:
                return this.getIdentifierName(writableSymbol);
        }
    }

    private getSizeString (intermediateSize: IntermediateSize): string
    {
        switch (intermediateSize)
        {
            case IntermediateSize.Int8:
                return TranspilerC.integer8TypeName;
            case IntermediateSize.Int16:
                return TranspilerC.integer16TypeName;
            case IntermediateSize.Int32:
                return TranspilerC.integer32TypeName;
            case IntermediateSize.Int64:
                return TranspilerC.integer64TypeName;
            case IntermediateSize.Native:
                return TranspilerC.integerTypeName;
            case IntermediateSize.Pointer:
                return 'void*';
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
            this.code.push(''); // Empty line
        }

        for (const external of fileIntermediate.externals)
        {
            this.transpileExternal(external);
        }

        if (fileIntermediate.externals.length > 0)
        {
            this.code.push(''); // Empty line
        }

        for (const global of fileIntermediate.globals)
        {
            this.transpileGlobal(global);
        }

        if (fileIntermediate.globals.length > 0)
        {
            this.code.push(''); // Empty line
        }

        if (fileIntermediate.structure !== null)
        {
            this.transpileStructure(fileIntermediate.structure);

            this.code.push(''); // Empty line
        }

        for (const functionNode of fileIntermediate.functions)
        {
            this.transpileFunction(functionNode);

            if (functionNode !== fileIntermediate.functions.at(-1))
            {
                this.code.push(''); // Empty line
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

        const identifierName = this.getIdentifierName(constantIntermediate.symbol);

        const line = `static ${TranspilerC.stringTypeName} ${identifierName} = `
            + `(${TranspilerC.stringTypeName})&(struct { Cardinal size; Cardinal8 data[${stringByteCount}]; })`
            + `{ .size = ${stringByteCount}, .data = "${constantIntermediate.symbol.value}" };`;

        this.code.push(line);
    }

    private transpileExternal (externalIntermediate: Intermediates.External): void
    {
        const parameters: string[] = [];

        for (const parameterSize of externalIntermediate.symbol.parameters)
        {
            const parameter = this.getSizeString(parameterSize);
            parameters.push(parameter);
        }

        const parameterString = parameters.join(', ');

        const line = `extern ${this.getSizeString(externalIntermediate.symbol.returnSize)} `
            + `${this.getIdentifierName(externalIntermediate.symbol)} (${parameterString}) `
            + `asm ("\\"${externalIntermediate.symbol.name}\\"");`;

        this.code.push(line);
    }

    private transpileGlobal (constantIntermediate: Intermediates.Global): void
    {
        const identifierName = this.getIdentifierName(constantIntermediate.symbol);
        const identifierSize = this.getSizeString(constantIntermediate.symbol.size);

        const line = `static ${identifierSize} ${identifierName};`;

        this.code.push(line);
    }

    private transpileStructure (structureIntermediate: Intermediates.Structure): void
    {
        this.code.push(
            `typedef struct ${this.getIdentifierName(structureIntermediate.symbol)}`,
            '{',
        );

        for (const field of structureIntermediate.symbol.fields)
        {
            const fieldSizeString = this.getSizeString(field.size);
            const fieldName = this.getFieldName(field);

            this.code.push(
                `${fieldSizeString} ${fieldName};`,
            );
        }

        this.code.push(
            `} ${this.getIdentifierName(structureIntermediate.symbol)};`,
        );
    }

    private transpileFunction (functionIntermediate: Intermediates.Function): void
    {
        this.variableCounter = -1;
        this.outgoingParameterIndexToName = new Map();
        this.incomingReturnName = null;
        this.currentFunction = functionIntermediate.symbol;

        const returnSizeString = this.getSizeString(functionIntermediate.symbol.returnSize);

        const parameterStrings: string[] = [];
        for (let parameterIndex = 0; parameterIndex < functionIntermediate.symbol.parameters.length; parameterIndex++)
        {
            const parameterSize = functionIntermediate.symbol.parameters[parameterIndex];
            const parameterSizeString = this.getSizeString(parameterSize);
            const parameterName = this.getParameterName(parameterIndex);
            const parameterString = parameterSizeString + ' ' + parameterName;

            parameterStrings.push(parameterString);
        }

        const parameterString = parameterStrings.join(', ');

        const functionHeader = `${returnSizeString} ${this.getIdentifierName(functionIntermediate.symbol)} (${parameterString})`;

        this.code.push(
            `${functionHeader} asm ("\\"${functionIntermediate.symbol.name}\\"");`,
            `${functionHeader}`,
        );

        this.code.push(
            '{',
        );

        for (const instruction of functionIntermediate.body)
        {
            this.transpileStatement(instruction);
        }

        this.code.push(
            '}',
        );

        this.variableCounter = -1;
        this.outgoingParameterIndexToName = new Map();
        this.incomingReturnName = null;
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

    private transpileAdd (addIntermediate: Intermediates.Add): void
    {
        const leftOperandName = this.getVariableName(addIntermediate.leftOperand);
        const rightOperandName = this.getVariableName(addIntermediate.rightOperand);

        this.code.push(
            `${leftOperandName} = ${leftOperandName} + ${rightOperandName};`,
        );
    }

    private transpileAnd (andIntermediate: Intermediates.And): void
    {
        const leftOperandName = this.getVariableName(andIntermediate.leftOperand);
        const rightOperandName = this.getVariableName(andIntermediate.rightOperand);

        this.code.push(
            `${leftOperandName} = ${leftOperandName} & ${rightOperandName};`,
        );
    }

    private transpileCall (callIntermediate: Intermediates.Call): void
    {
        const parameterStrings: string[] = [];
        for (let parameterIndex = 0; parameterIndex < callIntermediate.functionSymbol.parameters.length; parameterIndex++)
        {
            const parameterName = this.outgoingParameterIndexToName.get(parameterIndex);
            if (parameterName === undefined)
            {
                throw new Error('Transpiler error: Cannot call function because a parameter is not introduced.');
            }

            parameterStrings.push(parameterName);
        }
        this.outgoingParameterIndexToName.clear();

        const parameterString = parameterStrings.join(', ');

        if (callIntermediate.functionSymbol.returnSize === IntermediateSize.Void)
        {
            this.code.push(
                `${this.getIdentifierName(callIntermediate.functionSymbol)}(${parameterString});`,
            );
        }
        else
        {
            const returnSizeString = this.getSizeString(callIntermediate.functionSymbol.returnSize);

            const returnName = this.nextVariableName;
            this.incomingReturnName = returnName;

            this.code.push(
                `${returnSizeString} ${returnName} = ${this.getIdentifierName(callIntermediate.functionSymbol)}(${parameterString});`,
            );
        }
    }

    private transpileCompare (compareIntermediate: Intermediates.Compare): void
    {
        /* Intermediate representation:
           - compare a b
           - jumpIfEqual/jumpIfGreater etc. trueLabel
           C:
           - <nothing here>
           - if (a ==/>/</!= b)
             {
                 goto trueLabel;
             }
        As we would need the condition now, we temporarily save the operands and use them later in the jump instruction. */
        // TODO: Could this be done better?

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
        const leftOperandName = this.getVariableName(divideIntermediate.leftOperand);
        const rightOperandName = this.getVariableName(divideIntermediate.rightOperand);

        this.code.push(
            `${leftOperandName} = ${leftOperandName} / ${rightOperandName};`,
        );
    }

    private transpileGive (giveIntermediate: Intermediates.Give): void
    {
        const fromVariableName = this.getVariableName(giveIntermediate.variable);
        const targetSizeString = this.getSizeString(giveIntermediate.targetSymbol.size);

        let targetName: string;

        switch (giveIntermediate.targetSymbol.kind)
        {
            case IntermediateSymbolKind.Parameter:
                targetName = this.nextVariableName;
                this.outgoingParameterIndexToName.set(giveIntermediate.targetSymbol.index, targetName);
                break;
            case IntermediateSymbolKind.ReturnValue:
                targetName = this.getReturnName(giveIntermediate.targetSymbol.index);
                break;
        }

        this.code.push(
            `${targetSizeString} ${targetName} = ${fromVariableName};`,
        );
    }

    private transpileGoto (gotoIntermediate: Intermediates.Goto): void
    {
        const labelName = this.getLabelName(gotoIntermediate.target);

        this.code.push(
            `goto ${labelName};`,
        );
    }

    private transpileIntroduce (introduceIntermediate: Intermediates.Introduce): void
    {
        const localName = this.getVariableName(introduceIntermediate.variableSymbol);
        const sizeString = this.getSizeString(introduceIntermediate.variableSymbol.size);

        this.code.push(
            `${sizeString} ${localName};`,
        );
    }

    private transpileJumpIfEqual (jumpIfEqualIntermediate: Intermediates.JumpIfEqual): void
    {
        this.transpileConditionalJump('==', jumpIfEqualIntermediate.target);
    }

    private transpileJumpIfGreater (jumpIfGreaterIntermediate: Intermediates.JumpIfGreater): void
    {
        this.transpileConditionalJump('>', jumpIfGreaterIntermediate.target);
    }

    private transpileJumpIfLess (jumpIfLessIntermediate: Intermediates.JumpIfLess): void
    {
        this.transpileConditionalJump('<', jumpIfLessIntermediate.target);
    }

    private transpileJumpIfNotEqual (jumpIfNotEqualIntermediate: Intermediates.JumpIfNotEqual): void
    {
        this.transpileConditionalJump('!=', jumpIfNotEqualIntermediate.target);
    }

    private transpileConditionalJump (condition: string, target: IntermediateSymbols.Label): void
    {
        if (this.compareOperands === null)
        {
            throw new Error('Transpiler error: Cannot jump because no compare is in progress.');
        }
        const [leftOperand, rightOperand] = this.compareOperands;

        const leftOperandName = this.getVariableName(leftOperand);
        const rightOperandName = this.getVariableName(rightOperand);
        const labelName = this.getLabelName(target);

        this.code.push(
            `if (${leftOperandName} ${condition} ${rightOperandName})`,
            `{`,
            `goto ${labelName};`,
            `}`,
        );

        this.compareOperands = null;
    }

    private transpileLabel (labelIntermediate: Intermediates.Label): void
    {
        const labelName = this.getLabelName(labelIntermediate.symbol);

        this.code.push(
            `${labelName}:`,
        );
    }

    private transpileLoadField (loadFieldIntermediate: Intermediates.LoadField): void
    {
        const toName = this.getVariableName(loadFieldIntermediate.to);
        const thisReferenceName = this.getVariableName(loadFieldIntermediate.thisReference);
        const structureName = this.getIdentifierName(loadFieldIntermediate.structure);
        const fieldName = this.getFieldName(loadFieldIntermediate.field);

        this.code.push(
            `${toName} = ((struct ${structureName}*)${thisReferenceName})->${fieldName};`,
        );
    }

    private transpileStoreField (storeFieldIntermediate: Intermediates.StoreField): void
    {
        const fromName = this.getVariableName(storeFieldIntermediate.from);
        const thisReferenceName = this.getVariableName(storeFieldIntermediate.thisReference);
        const structureName = this.getIdentifierName(storeFieldIntermediate.structure);
        const fieldName = this.getFieldName(storeFieldIntermediate.field);

        this.code.push(
            `((struct ${structureName}*)${thisReferenceName})->${fieldName} = ${fromName};`,
        );
    }

    private transpileModulo (moduloIntermediate: Intermediates.Modulo): void
    {
        const leftOperandName = this.getVariableName(moduloIntermediate.leftOperand);
        const rightOperandName = this.getVariableName(moduloIntermediate.rightOperand);

        this.code.push(
            `${leftOperandName} = ${leftOperandName} % ${rightOperandName};`,
        );
    }

    private transpileMove (moveIntermediate: Intermediates.Move): void
    {
        const destinationName = this.getVariableName(moveIntermediate.to);
        let sourceString: string;

        switch (moveIntermediate.from.kind)
        {
            case IntermediateSymbolKind.Constant:
            {
                sourceString = this.getIdentifierName(moveIntermediate.from);
                break;
            }
            case IntermediateSymbolKind.LocalVariable:
            case IntermediateSymbolKind.GlobalVariable:
            {
                sourceString = this.getVariableName(moveIntermediate.from);
                break;
            }
            case IntermediateSymbolKind.Literal:
            {
                sourceString = moveIntermediate.from.value;
                break;
            }
        }

        this.code.push(
            `${destinationName} = ${sourceString};`,
        );
    }

    private transpileMultiply (multiplyIntermediate: Intermediates.Multiply): void
    {
        const leftOperandName = this.getVariableName(multiplyIntermediate.leftOperand);
        const rightOperandName = this.getVariableName(multiplyIntermediate.rightOperand);

        this.code.push(
            `${leftOperandName} = ${leftOperandName} * ${rightOperandName};`,
        );
    }

    private transpileNegate (negateIntermediate: Intermediates.Negate): void
    {
        const operandName = this.getVariableName(negateIntermediate.operand);

        this.code.push(
            `${operandName} = -${operandName};`,
        );
    }

    private transpileNot (notIntermediate: Intermediates.Not): void
    {
        const operandName = this.getVariableName(notIntermediate.operand);

        this.code.push(
            `${operandName} = !${operandName};`,
        );
    }

    private transpileOr (orIntermediate: Intermediates.Or): void
    {
        const leftOperandName = this.getVariableName(orIntermediate.leftOperand);
        const rightOperandName = this.getVariableName(orIntermediate.rightOperand);

        this.code.push(
            `${leftOperandName} = ${leftOperandName} | ${rightOperandName};`,
        );
    }

    private transpileReturn (): void
    {
        if (this.currentFunction === null)
        {
            throw new Error('Transpiler error: Tried to return from outside a function.');
        }

        // TODO: Instead of needing the "currentFunction" workaround, could the return intermediate include the function symbol?

        if (this.currentFunction.returnSize == IntermediateSize.Void)
        {
            this.code.push(
                `return;`,
            );
        }
        else
        {
            const returnVariableName = this.getReturnName(0); // TODO: Multiple return values?

            this.code.push(
                `return ${returnVariableName};`,
            );
        }
    }

    private transpileSizeOf (sizeOfIntermediate: Intermediates.SizeOf): void
    {
        const toName = this.getVariableName(sizeOfIntermediate.to);
        const structureName = this.getIdentifierName(sizeOfIntermediate.structure);

        this.code.push(
            `${toName} = sizeof(${structureName});`,
        );
    }

    private transpileSubtract (subtractIntermediate: Intermediates.Subtract): void
    {
        const leftOperandName = this.getVariableName(subtractIntermediate.leftOperand);
        const rightOperandName = this.getVariableName(subtractIntermediate.rightOperand);

        this.code.push(
            `${leftOperandName} = ${leftOperandName} - ${rightOperandName};`,
        );
    }

    private transpileTake (takeIntermediate: Intermediates.Take): void
    {
        let takeableName: string;
        switch (takeIntermediate.takableValue.kind)
        {
            case IntermediateSymbolKind.Parameter:
                takeableName = this.getParameterName(takeIntermediate.takableValue.index);
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

        const variableName = this.getVariableName(takeIntermediate.variableSymbol);

        this.code.push(
            `${variableName} = ${takeableName};`,
        );
    }
}
