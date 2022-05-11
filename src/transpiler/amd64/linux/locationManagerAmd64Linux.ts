import * as Instructions from '../../common/instructions';
import * as IntermediateSymbols from '../../../lowerer/intermediateSymbols';
import { IntermediateSize } from '../../../lowerer/intermediateSize';
import { Register64Amd64 } from '../registers/register64Amd64';
import { RegistersAmd64Linux } from './registersAmd64Linux';

/**
 * Location manager with optimisation level "none". \
 * Puts everything onto the stack and only uses registers where needed.
 */
export class LocationManagerAmd64LinuxNone
{
    private instructions: Instructions.Instruction[];

    /**
     * The current offset of the base pointer, equivalent to the current stack frame size.
     */
    private currentBasePointerOffset: number;

    /* TODO: Should we only use names here instead of symbols?
             Is it guaranteed that the intermediate variable names are unique (in which scope)? */
    private variableToStackLocation: Map<IntermediateSymbols.Variable, string>;

    private variableToRegister: Map<IntermediateSymbols.Variable, Register64Amd64>;

    private registersInUse: Set<Register64Amd64>;

    constructor (instructions: Instructions.Instruction[])
    {
        this.instructions = instructions;
        this.variableToStackLocation = new Map();
        this.variableToRegister = new Map();
        this.registersInUse = new Set();

        this.currentBasePointerOffset = 0;
    }

    private intermediateSizeToByteSize (intermediateSize: IntermediateSize): 1 | 2 | 4 | 8
    {
        switch (intermediateSize)
        {
            case IntermediateSize.Int8:
                return 1;
            case IntermediateSize.Int16:
                return 2;
            case IntermediateSize.Int32:
                return 4;
            case IntermediateSize.Int64:
            case IntermediateSize.Native:
            case IntermediateSize.Pointer:
                return 8;
            case IntermediateSize.Void:
                throw new Error('Transpiler error: Cannot get the byte size of type "Void".');
        }
    }

    private getRegisterNameForSize (register: Register64Amd64, intermediateSize: IntermediateSize): string
    {
        const byteSize = this.intermediateSizeToByteSize(intermediateSize);

        switch (byteSize)
        {
            case 1:
                return register.bit8;
            case 2:
                return register.bit16;
            case 4:
                return register.bit32;
            case 8:
                return register.bit64;
        }
    }

    public enterFunction (): void
    {
        this.currentBasePointerOffset = 0;

        if (this.variableToStackLocation.size > 0)
        {
            // TODO: Should this be a diagnostic error? If yes, we would need to know when exactly the variables have not been dismissed.
            throw new Error('Transpiler error: Not all variables have been dismissed.');
        }

        if ((this.variableToRegister.size > 0) || (this.registersInUse.size > 0))
        {
            // TODO: Should this be a diagnostic error? If yes, we would need to know when exactly the variables have not been unpinned.
            throw new Error('Transpiler error: Not all variables have been unpinned.');
        }

        this.instructions.push(
            // Save base pointer:
            new Instructions.Instruction('push', RegistersAmd64Linux.stackBasePointer.bit64),
            // Set base pointer to current stack pointer:
            new Instructions.Instruction('mov', RegistersAmd64Linux.stackBasePointer.bit64, RegistersAmd64Linux.stackPointer.bit64),
        );

        this.currentBasePointerOffset += 8; // Push stack base pointer.
    }

    public leaveFunction (): void
    {
        this.instructions.push(
            new Instructions.Instruction('leave'),
        );

        this.currentBasePointerOffset -= 8; // Pop stack base pointer inside leave.
    }

    public introduce (variableSymbol: IntermediateSymbols.Variable): void
    {
        const stackLocation = `[${RegistersAmd64Linux.stackBasePointer.bit64}-${this.currentBasePointerOffset}]`;

        //const variableSizeInBytes = this.intermediateSizeToByteSize(variableSymbol.size);
        const variableSizeInBytes = 8; // TODO: We have to take into account stack alignment here.

        this.instructions.push(
            new Instructions.Instruction('sub', RegistersAmd64Linux.stackPointer.bit64, `${variableSizeInBytes}`),
        );

        this.currentBasePointerOffset += variableSizeInBytes;

        this.variableToStackLocation.set(variableSymbol, stackLocation);
    }

    public dismiss (variableSymbol: IntermediateSymbols.Variable): void
    {
        this.variableToStackLocation.delete(variableSymbol);
    }

    public getLocation (variableSymbol: IntermediateSymbols.Variable): string
    {
        if (this.variableToRegister.has(variableSymbol))
        {
            const register = this.variableToRegister.get(variableSymbol);

            if (register === undefined)
            {
                throw new Error('Transpiler error: Map.has returned true while Map.get returned undefined.');
            }

            const registerName = this.getRegisterNameForSize(register, variableSymbol.size);

            return registerName;
        }
        else
        {
            const stackLocation = this.variableToStackLocation.get(variableSymbol);

            if (stackLocation === undefined)
            {
                throw new Error('Transpiler error: Variable has been used before it has been introduced.');
            }

            return stackLocation;
        }
    }

    /**
     * Pins the given variable to any free register until it is unpinned.
     */
    public pinVariableToRegister (variableSymbol: IntermediateSymbols.Variable): void
    {
        for (const register of RegistersAmd64Linux.calleeSaved)
        {
            if (!this.registersInUse.has(register))
            {
                const stackLocation = this.getLocation(variableSymbol);

                this.registersInUse.add(register);
                this.variableToRegister.set(variableSymbol, register);

                // TODO: Save register!

                const registerName = this.getRegisterNameForSize(register, variableSymbol.size);

                this.instructions.push(
                    new Instructions.Instruction('mov', registerName, stackLocation),
                );

                return;
            }
        }

        /* TODO: This should not be able to happen as a maximum of two registers can be in use at the same time.
                 But shouldn't this be a diagnostic error regardless? */
        throw new Error('Transpiler error: No free register available.');
    }

    /**
     * Unpins the given variable from its register.
     * @param variableSymbol The variable to unpin.
     * @param hasChanged True if the variable has been changed, false otherwise. Will save the variable to its stack location if true.
     */
    public unpinVariableFromRegister (variableSymbol: IntermediateSymbols.Variable, hasChanged = true): void
    {
        const register = this.variableToRegister.get(variableSymbol);

        if (register === undefined)
        {
            throw new Error('Transpiler error: Tried to unpin a variable that has not been pinned.');
        }

        this.variableToRegister.delete(variableSymbol);
        this.registersInUse.delete(register);

        // Save variable value to its stack location:
        if (hasChanged)
        {
            const registerName = this.getRegisterNameForSize(register, variableSymbol.size);

            this.instructions.push(
                new Instructions.Instruction('mov', this.getLocation(variableSymbol), registerName),
            );
        }

        // TODO: Restore register!
    }

    public getParameterLocation (parameter: IntermediateSymbols.Parameter): string
    {
        const maxParameterCount = RegistersAmd64Linux.integerArguments.length;

        if (parameter.index >= maxParameterCount)
        {
            throw new Error(
                `Transpiler error: Stack parameters are not supported. There must not be more than ${maxParameterCount} parameters.`
            );
        }

        const parameterRegister = RegistersAmd64Linux.integerArguments[parameter.index];

        const registerName = this.getRegisterNameForSize(parameterRegister, parameter.size);

        return registerName;
    }

    public getReturnValueLocation (returnValue: IntermediateSymbols.ReturnValue): string
    {
        if (returnValue.index > 0)
        {
            throw new Error(
                `Transpiler error: Multiple return values are not supported.`
            );
        }

        const returnRegister = RegistersAmd64Linux.integerReturn;

        const registerName = this.getRegisterNameForSize(returnRegister, returnValue.size);

        return registerName;
    }
}
