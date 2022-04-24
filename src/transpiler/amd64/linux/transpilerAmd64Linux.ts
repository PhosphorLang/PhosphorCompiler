import * as Instructions from '../../common/instructions';
import * as Intermediates from '../../../lowerer/intermediates';
import { DirectiveInstruction } from './directiveInstruction';
import { IntermediateKind } from '../../../lowerer/intermediateKind';
import { IntermediateSymbolKind } from '../../../lowerer/intermediateSymbolKind';
import { LocationManagerAmd64LinuxNone } from './locationManagerAmd64Linux';
import { TextEncoder } from 'node:util';
import { Transpiler } from '../../transpiler';

export class TranspilerAmd64Linux implements Transpiler
{
    private instructions: Instructions.Instruction[];

    private locationManager: LocationManagerAmd64LinuxNone;

    constructor ()
    {
        this.instructions = [];

        this.locationManager = new LocationManagerAmd64LinuxNone(this.instructions);
    }

    public run (fileIntermediate: Intermediates.File): string
    {
        this.transpileFile(fileIntermediate);

        this.instructions.push(
            new DirectiveInstruction('extern', 'exit'),
            // The start routine calls main and then exits properly:
            new DirectiveInstruction('global', '_start'),
            new Instructions.Label('_start'),
            new Instructions.Instruction('call', 'main'),
            new Instructions.Instruction('call', 'exit'),
        );

        const fileAssembly = this.convertInstructionsToAssembly(this.instructions);

        this.instructions = [];

        return fileAssembly;
    }

    private convertInstructionsToAssembly (instructions: Instructions.Instruction[]): string
    {
        /** Render options for simple NASM Assembly statements */
        const statementRenderOptions: Instructions.RenderOptions = {
            commandOperandSplitter: ' ',
            operandSplitter: ', ',
            prefix: '',
            postfix: '',
        };

        let assembly = '';

        for (const instruction of instructions)
        {
            assembly += instruction.render(statementRenderOptions) + '\n';
        }

        return assembly;
    }

    private transpileFile (fileIntermediate: Intermediates.File): void
    {
        this.instructions.push(
            new DirectiveInstruction('section', '.rodata'),
        );

        for (const constantIntermediate of fileIntermediate.constants)
        {
            this.transpileConstant(constantIntermediate);
        }

        this.instructions.push(
            new DirectiveInstruction('section', '.text'),
        );

        for (const externalIntermediate of fileIntermediate.externals)
        {
            this.transpileExternal(externalIntermediate);
        }

        for (const functionIntermediate of fileIntermediate.functions)
        {
            this.transpileFunction(functionIntermediate);
        }
    }

    private transpileConstant (constantIntermediate: Intermediates.Constant): void
    {
        // TODO: For now, constants are strings. This might change in the future.

        const constantValue = constantIntermediate.symbol.value;

        // We need an encoded string to get the real byte count:
        const encoder = new TextEncoder();
        const encodedString = encoder.encode(constantValue);

        const constantId = constantIntermediate.symbol.name;
        const constantLength = encodedString.length;

        // The string is a byte array prefixed with it's (platform dependent) length:
        this.instructions.push(
            new Instructions.Label(constantId),
            new Instructions.Instruction('dq', `${constantLength}`),
            new Instructions.Instruction('db', `'${constantValue}'`),
        );
    }

    private transpileExternal (externalIntermediate: Intermediates.External): void
    {
        this.instructions.push(
            new DirectiveInstruction('extern', `${externalIntermediate.symbol.name}`),
        );
    }

    private transpileFunction (functionIntermediate: Intermediates.Function): void
    {
        this.instructions.push(
            new Instructions.Label(functionIntermediate.symbol.name),
        );

        this.locationManager.enterFunction();

        for (const instruction of functionIntermediate.body)
        {
            this.transpileStatement(instruction);
        }
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
                this.transpileDismiss(statementIntermediate);
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
        this.locationManager.pinVariableToRegister(addIntermediate.leftOperand);

        const leftOperandLocation = this.locationManager.getLocation(addIntermediate.leftOperand);
        const rightOperandLocation = this.locationManager.getLocation(addIntermediate.rightOperand);

        this.instructions.push(
            new Instructions.Instruction('add', leftOperandLocation, rightOperandLocation),
        );

        this.locationManager.unpinVariableFromRegister(addIntermediate.leftOperand);
    }

    private transpileCall (callIntermediate: Intermediates.Call): void
    {
        this.instructions.push(
            new Instructions.Instruction('call', callIntermediate.functionSymbol.name),
        );
    }

    private transpileCompare (compareIntermediate: Intermediates.Compare): void
    {
        this.locationManager.pinVariableToRegister(compareIntermediate.leftOperand);

        const leftOperandLocation = this.locationManager.getLocation(compareIntermediate.leftOperand);
        const rightOperandLocation = this.locationManager.getLocation(compareIntermediate.rightOperand);

        this.instructions.push(
            new Instructions.Instruction('cmp', leftOperandLocation, rightOperandLocation),
        );

        this.locationManager.unpinVariableFromRegister(compareIntermediate.leftOperand, false);
    }

    private transpileDismiss (dismissIntermediate: Intermediates.Dismiss): void
    {
        this.locationManager.dismiss(dismissIntermediate.variableSymbol);
    }

    private transpileGive (giveIntermediate: Intermediates.Give): void
    {
        switch (giveIntermediate.targetSymbol.kind)
        {
            case IntermediateSymbolKind.Parameter:
            {
                const parameterLocation = this.locationManager.getParameterLocation(giveIntermediate.targetSymbol);
                const variableLocation = this.locationManager.getLocation(giveIntermediate.variable);

                this.instructions.push(
                    new Instructions.Instruction('mov', parameterLocation, variableLocation),
                );

                break;
            }
            case IntermediateSymbolKind.ReturnValue:
            {
                const returnLocation = this.locationManager.getReturnValueLocation(giveIntermediate.targetSymbol);
                const variableLocation = this.locationManager.getLocation(giveIntermediate.variable);

                this.instructions.push(
                    new Instructions.Instruction('mov', returnLocation, variableLocation),
                );

                break;
            }
        }
    }

    private transpileGoto (gotoIntermediate: Intermediates.Goto): void
    {
        this.instructions.push(
            new Instructions.Instruction('jmp', gotoIntermediate.target.name),
        );
    }

    private transpileIntroduce (introduceIntermediate: Intermediates.Introduce): void
    {
        this.locationManager.introduce(introduceIntermediate.variableSymbol);
    }

    private transpileJumpIfEqual (jumpIfEqualIntermediate: Intermediates.JumpIfEqual): void
    {
        this.instructions.push(
            new Instructions.Instruction('je', jumpIfEqualIntermediate.target.name),
        );
    }

    private transpileJumpIfGreater (jumpIfGreaterIntermediate: Intermediates.JumpIfGreater): void
    {
        this.instructions.push(
            new Instructions.Instruction('jg', jumpIfGreaterIntermediate.target.name),
        );
    }

    private transpileJumpIfLess (jumpIfLessIntermediate: Intermediates.JumpIfLess): void
    {
        this.instructions.push(
            new Instructions.Instruction('jl', jumpIfLessIntermediate.target.name),
        );
    }

    private transpileLabel (labelIntermediate: Intermediates.Label): void
    {
        // TODO: Should we make the labels "local labels" starting with a point?
        this.instructions.push(
            new Instructions.Label(labelIntermediate.symbol.name),
        );
    }

    private transpileMove (moveIntermediate: Intermediates.Move): void
    {
        this.locationManager.pinVariableToRegister(moveIntermediate.to);

        let fromLocation: string;

        switch (moveIntermediate.from.kind)
        {
            case IntermediateSymbolKind.Constant:
                fromLocation = moveIntermediate.from.name;
                break;
            case IntermediateSymbolKind.Literal:
                fromLocation = moveIntermediate.from.value;
                break;
            case IntermediateSymbolKind.Variable:
                fromLocation = this.locationManager.getLocation(moveIntermediate.from);
                break;
        }

        const toLocation = this.locationManager.getLocation(moveIntermediate.to);

        this.instructions.push(
            new Instructions.Instruction('mov', toLocation, fromLocation),
        );

        this.locationManager.unpinVariableFromRegister(moveIntermediate.to);
    }

    private transpileNegate (negateIntermediate: Intermediates.Negate): void
    {
        const operandLocation = this.locationManager.getLocation(negateIntermediate.operand);

        this.instructions.push(
            new Instructions.Instruction('neg', operandLocation),
        );
    }

    private transpileReturn (): void
    {
        this.locationManager.leaveFunction();

        this.instructions.push(
            new Instructions.Instruction('ret'),
        );
    }

    private transpileSubtract (subtractIntermediate: Intermediates.Subtract): void
    {
        this.locationManager.pinVariableToRegister(subtractIntermediate.leftOperand);

        const leftOperandLocation = this.locationManager.getLocation(subtractIntermediate.leftOperand);
        const rightOperandLocation = this.locationManager.getLocation(subtractIntermediate.rightOperand);

        this.instructions.push(
            new Instructions.Instruction('sub', leftOperandLocation, rightOperandLocation),
        );

        this.locationManager.unpinVariableFromRegister(subtractIntermediate.leftOperand);
    }

    private transpileTake (takeIntermediate: Intermediates.Take): void
    {
        switch (takeIntermediate.takableValue.kind)
        {
            case IntermediateSymbolKind.Parameter:
            {
                const parameterLocation = this.locationManager.getParameterLocation(takeIntermediate.takableValue);
                const variableLocation = this.locationManager.getLocation(takeIntermediate.variableSymbol);

                this.instructions.push(
                    new Instructions.Instruction('mov', variableLocation, parameterLocation),
                );

                break;
            }
            case IntermediateSymbolKind.ReturnValue:
            {
                const returnLocation = this.locationManager.getReturnValueLocation(takeIntermediate.takableValue);
                const variableLocation = this.locationManager.getLocation(takeIntermediate.variableSymbol);

                this.instructions.push(
                    new Instructions.Instruction('mov', variableLocation, returnLocation),
                );

                break;
            }
        }
    }
}
