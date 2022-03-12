import * as SemanticSymbols from '../../../connector/semanticSymbols';
import LocationedVariableAmd64 from '../locationedVariableAmd64';
import Register64Amd64 from '../registers/register64Amd64';
import RegistersAmd64Linux from './registersAmd64Linux';

type VariableStack = Map<SemanticSymbols.Variable, LocationedVariableAmd64>;

// TODO: This must be reworked.
//       We need a very simple location manager that puts everything onto the stack for debugging.
//       And then use, when compiling in optimised mode, this smart approach.
export default abstract class LocationManagerAmd64Linux
{
    protected abstract code: string[];

    /**
     * A list of variable lists, working as a stack.
     * At the beginning of each function and section a new list is pushed, at the end of them it is removed.
     * With this we keep track of which variables are used at which point in the code.
     */
    private variableStacks: VariableStack[];

    /**
     * The set of registers currently in use.
     */
    private registersInUse: Set<Register64Amd64>;

    /**
     * The map of used callee saved registers (to their stack location) that must be restored at the end of the function.
     */
    private usedCalleeSavedRegisters: Map<Register64Amd64, string>;

    /**
     * A list of currently saved register lists. Before a function call a list is added and filled, after it is removed again.
     */
    private currentlySavedRegistersList: Register64Amd64[][];

    /**
     * The current offset of the base pointer, equivalent to the current stack frame size.
     */
    private currentBasePointerOffset: number;

    private get lastVariableStack (): VariableStack
    {
        const lastVariableStack = this.variableStacks[this.variableStacks.length - 1];

        return lastVariableStack;
    }

    private get nextStackLocation (): string
    {
        // TODO: Replace the hardcoded size with the real type sizes:
        const stackLocation = `[${RegistersAmd64Linux.stackBasePointer.bit64}-${this.currentBasePointerOffset}]`;
        this.currentBasePointerOffset += 8;
        this.code.push(`sub ${RegistersAmd64Linux.stackPointer.bit64}, 8`);

        return stackLocation;
    }

    constructor ()
    {
        this.variableStacks = [];
        this.registersInUse = new Set<Register64Amd64>();
        this.usedCalleeSavedRegisters = new Map<Register64Amd64, string>();
        this.currentlySavedRegistersList = [];
        this.currentBasePointerOffset = 0;
    }

    protected addNewVariableStack (isFunctionInitialisation = false): void
    {
        const newStack = new Map<SemanticSymbols.Variable, LocationedVariableAmd64>();

        this.variableStacks.push(newStack);

        if (isFunctionInitialisation)
        {
            this.registersInUse.clear();
            this.usedCalleeSavedRegisters.clear();
            this.currentBasePointerOffset = 0;
        }
    }

    protected removeLastVariableStack (isFunctionFinalisation = false): void
    {
        for (const variable of this.lastVariableStack.keys())
        {
            this.freeVariable(variable);
        }

        this.variableStacks.pop();

        if (isFunctionFinalisation)
        {
            // Restore the callee saved registers:
            for (const [register, location] of this.usedCalleeSavedRegisters)
            {
                this.code.push(`mov ${register.bit64}, QWORD ${location}`); // Saved registers must always be the full 8 bytes long.
            }
        }
    }

    /**
     * Push a variable to a location.
     * @param variable The variable to push.
     * @param location The location to push to. If ommitted the next free register is used, or if none is free the memory.
     * @param saveToMemoryWhenInUse If true and the location is in use, the content will be moved to the memory and not to a free register.
     *                              This can be used to keep the registers free, e.g. before a function call.
     */
    protected pushVariable (variable: SemanticSymbols.Variable, location?: Register64Amd64|string, saveToMemoryWhenInUse = false): LocationedVariableAmd64
    {
        let targetLocation: Register64Amd64|string;

        if (location === undefined)
        {
            targetLocation = this.getNextLocation();
        }
        else
        {
            // If the location is a register in use we must free it before we can use it.

            if ((location instanceof Register64Amd64) && (this.registersInUse.has(location)))
            {
                const locationedVariable = this.getVariableForLocation(location);

                // Get the next stack location if it must be saved to memory, otherwise simply get the next location:
                const newVariableLocation = saveToMemoryWhenInUse ? this.nextStackLocation : this.getNextLocation();

                const oldLocationString = locationedVariable.locationString;

                locationedVariable.location = newVariableLocation;

                this.code.push(`mov ${locationedVariable.locationString}, ${oldLocationString}`);
            }

            targetLocation = location;
        }

        const locationedVariable = new LocationedVariableAmd64(variable, targetLocation);

        this.lastVariableStack.set(variable, locationedVariable);

        return locationedVariable;
    }

    private getVariableForLocation (location: Register64Amd64|string): LocationedVariableAmd64
    {
        for (const variableStack of this.variableStacks)
        {
            for (const locationedVariable of variableStack.values())
            {
                if (locationedVariable.location == location)
                {
                    return locationedVariable;
                }
            }
        }

        let locationAsString: string;
        if (location instanceof Register64Amd64)
        {
            locationAsString = location.bit64;
        }
        else
        {
            locationAsString = location;
        }

        throw new Error(`Transpiler error: For the given location "${locationAsString}" there is no variable known.`);
    }

    private getNextLocation (): Register64Amd64|string
    {
        const register = this.getNextFreeRegister();

        if (register === null)
        {
            const stackLocation = this.nextStackLocation;

            return stackLocation;
        }
        else
        {
            return register;
        }
    }

    private getNextFreeRegister (): Register64Amd64|null
    {
        // Priority of registers: Caller saved, arguments, callee saved.
        // FIXME: We must save callee saved registers before use and restore them after it or at the end of the function!
        const registers = [...RegistersAmd64Linux.callerSaved, ...RegistersAmd64Linux.integerArguments, ...RegistersAmd64Linux.calleeSaved];

        for (const register of registers)
        {
            if (!this.registersInUse.has(register))
            {
                // Save registers that must be saved by the callee:
                if (RegistersAmd64Linux.calleeSaved.includes(register))
                {
                    const stackLocation = this.nextStackLocation;

                    this.code.push(`mov ${stackLocation}, ${register.bit64}`);

                    this.usedCalleeSavedRegisters.set(register, stackLocation);
                }

                this.registersInUse.add(register);

                return register;
            }
        }

        return null;
    }

    protected freeVariable (variable: SemanticSymbols.Variable): void
    {
        for (const variableStack of this.variableStacks.slice().reverse())
        {
            const variableLocation = variableStack.get(variable);

            if (variableLocation !== undefined)
            {
                variableStack.delete(variable);

                if (variableLocation.location instanceof Register64Amd64)
                {
                    this.registersInUse.delete(variableLocation.location);
                }

                return;
            }
        }

        throw new Error(`Transpiler error: The given variable "${variable.name}" cannot be freed because it is unknown.`);
    }

    protected getVariableLocation (variable: SemanticSymbols.Variable): LocationedVariableAmd64
    {
        for (const variableStack of this.variableStacks.slice().reverse())
        {
            const variableLocation = variableStack.get(variable);

            if (variableLocation !== undefined)
            {
                return variableLocation;
            }
        }

        throw new Error(`Transpiler error: The given variable "${variable.name}" has no location.`);
    }

    protected moveVariableToRegister (locationedVariable: LocationedVariableAmd64): LocationedVariableAmd64
    {
        if (!(locationedVariable.location instanceof Register64Amd64))
        {
            const register = this.makeAnyRegisterFree();

            // Move our stack variable into a register:
            // TODO: Replace the hardcoded size with the real type size:
            this.code.push(`mov ${register.bit64}, ${locationedVariable.locationString}`);
            locationedVariable.location = register;
        }

        return locationedVariable;
    }

    private makeAnyRegisterFree (): Register64Amd64
    {
        let register = this.getNextFreeRegister();

        if (register === null)
        {
            const locationedVariableInRegister = this.getAnyVariableInRegister();

            register = locationedVariableInRegister.location as Register64Amd64;

            const stackLocation = this.nextStackLocation;

            // Move register variable to the stack:
            this.code.push(`mov ${stackLocation}, ${locationedVariableInRegister.locationString}`);
            locationedVariableInRegister.location = stackLocation;
        }

        return register;
    }

    private getAnyVariableInRegister (): LocationedVariableAmd64
    {
        for (const stack of this.variableStacks)
        {
            for (const locationedVariable of stack.values())
            {
                if (locationedVariable.location instanceof Register64Amd64)
                {
                    return locationedVariable;
                }
            }
        }

        throw new Error('Transpile error: There are no registers. How can this happen?');
    }

    /**
     * Save the currently in use caller saved registers before a function call.
     * @param targetLocation The target location of the function call, for it to be ignored instead of saved.
     * @param isSystemCall If true, the registers for a system call are saved instead of a normal function call.
     */
    protected saveRegistersForFunctionCall (targetLocation: LocationedVariableAmd64|undefined, isSystemCall = false): void
    {
        const registersToSave: Set<Register64Amd64> = new Set<Register64Amd64>();

        // NOTE: The order of the registers (i.e. the reverse of the restore registers function) is important!
        if (isSystemCall)
        {
            for (const register of [...RegistersAmd64Linux.syscallArguments, ...RegistersAmd64Linux.syscallCallerSaved])
            {
                registersToSave.add(register);
            }
        }
        else
        {
            registersToSave.add(RegistersAmd64Linux.integerReturn);

            for (const register of [...RegistersAmd64Linux.integerArguments, ...RegistersAmd64Linux.callerSaved])
            {
                registersToSave.add(register);
            }
        }

        // Do not save the target location if it is a register:
        if (targetLocation?.location instanceof Register64Amd64)
        {
            registersToSave.delete(targetLocation.location);
        }

        const currentlySavedRegisters: Register64Amd64[] = [];

        for (const register of registersToSave)
        {
            if (this.registersInUse.has(register))
            {
                this.code.push(`push ${register.bit64}`);

                this.registersInUse.delete(register);

                currentlySavedRegisters.push(register);
            }
        }

        this.currentlySavedRegistersList.push(currentlySavedRegisters);
    }

    protected restoreRegistersAfterFunctionCall (): void
    {
        const currentlySavedRegisters = this.currentlySavedRegistersList.pop();

        if (currentlySavedRegisters === undefined)
        {
            throw new Error('Transpiler error: Tried to restore registers after a function call without saving them.');
        }

        // The currently saved registers list must be reversed to correctly pop the values into their registers:
        currentlySavedRegisters.reverse();

        for (const register of currentlySavedRegisters)
        {
            this.code.push(`pop ${register.bit64}`);

            this.registersInUse.add(register);
        }
    }
}
