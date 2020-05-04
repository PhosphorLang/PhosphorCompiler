import * as SemanticSymbols from "../../../connector/semanticSymbols";
import LocationedVariable from "../../common/locationedVariable";
import Register64 from "../../common/register64";
import RegistersAmd64Linux from "./registersAmd64Linux";

type VariableStack = Map<SemanticSymbols.Variable, LocationedVariable>;

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
    private registersInUse: Set<Register64>;

    /**
     * The map of used callee saved registers (to their stack location) that must be restored at the end of the function.
     */
    private usedCalleeSavedRegisters: Map<Register64, string>;

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
        const stackLocation = `[${RegistersAmd64Linux.stackBasePointer}-${this.currentBasePointerOffset}]`;
        this.currentBasePointerOffset += 8;
        this.code.push(`add ${RegistersAmd64Linux.stackPointer}, 8`);

        return stackLocation;
    }

    constructor ()
    {
        this.variableStacks = [];
        this.registersInUse = new Set<Register64>();
        this.usedCalleeSavedRegisters = new Map<Register64, string>();
        this.currentBasePointerOffset = 0;
    }

    protected addNewVariableStack (isFunctionInitialisation = false): void
    {
        const newStack = new Map<SemanticSymbols.Variable, LocationedVariable>();

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

    protected pushVariable (variable: SemanticSymbols.Variable, location?: Register64|string): LocationedVariable
    {
        let targetLocation: Register64|string;

        if (location === undefined)
        {
            targetLocation = this.getNextLocation();
        }
        else
        {
            // If the location is a register in use we must free it before we can use it.

            if ((location instanceof Register64) && (this.registersInUse.has(location)))
            {
                const locationedVariable = this.getVariableForLocation(location);

                const newVariableLocation = this.getNextLocation();

                const oldLocationString = locationedVariable.locationString;

                locationedVariable.location = newVariableLocation;

                this.code.push(`mov ${locationedVariable.locationString}, ${oldLocationString}`);
            }

            targetLocation = location;
        }

        const locationedVariable = new LocationedVariable(variable, targetLocation);

        this.lastVariableStack.set(variable, locationedVariable);

        return locationedVariable;
    }

    private getVariableForLocation (location: Register64|string): LocationedVariable
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
        if (location instanceof Register64)
        {
            locationAsString = location.bit64;
        }
        else
        {
            locationAsString = location;
        }

        throw new Error(`Transpiler error: For the given location "${locationAsString}" there is no variable known.`);
    }

    private getNextLocation (): Register64|string
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

    private getNextFreeRegister (): Register64|null
    {
        // Priority of registers: Caller saved, arguments, callee saved.
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
        for (const variableStack of this.variableStacks.reverse())
        {
            const variableLocation = variableStack.get(variable);

            if (variableLocation !== undefined)
            {
                variableStack.delete(variable);

                if (variableLocation.location instanceof Register64)
                {
                    this.registersInUse.delete(variableLocation.location);
                }

                return;
            }
        }

        throw new Error(`Transpiler error: The given variable "${variable.name}" cannot be freed because it is unknown.`);
    }

    protected getVariableLocation (variable: SemanticSymbols.Variable): LocationedVariable
    {
        for (const variableStack of this.variableStacks.reverse())
        {
            const variableLocation = variableStack.get(variable);

            if (variableLocation !== undefined)
            {
                return variableLocation;
            }
        }

        throw new Error(`Transpiler error: The given variable "${variable.name}" has no location.`);
    }

    protected moveVariableToRegister (locationedVariable: LocationedVariable): LocationedVariable
    {
        if (!(locationedVariable.location instanceof Register64))
        {
            const register = this.makeAnyRegisterFree();

            // Move our stack variable into a register:
            // TODO: Replace the hardcoded size with the real type size:
            this.code.push(`mov ${register.bit64}, ${locationedVariable.locationString}`);
            locationedVariable.location = register;
        }

        return locationedVariable;
    }

    private makeAnyRegisterFree (): Register64
    {
        let register = this.getNextFreeRegister();

        if (register === null)
        {
            const locationedVariableInRegister = this.getAnyVariableInRegister();

            register = locationedVariableInRegister.location as Register64;

            const stackLocation = this.nextStackLocation;

            // Move register variable to the stack:
            this.code.push(`mov ${stackLocation}, ${locationedVariableInRegister.locationString}`);
            locationedVariableInRegister.location = stackLocation;
        }

        return register;
    }

    private getAnyVariableInRegister (): LocationedVariable
    {
        for (const stack of this.variableStacks)
        {
            for (const locationedVariable of stack.values())
            {
                if (locationedVariable.location instanceof Register64)
                {
                    return locationedVariable;
                }
            }
        }

        throw new Error('Transpile error: There are no registers. How can this happen?');
    }

    protected saveRegistersForFunctionCall (isSystemCall = false): void
    {
        const registersToSave: Register64[] = []; // TODO: Replace with a Set.

        // NOTE: The order of the registers (i.e. the reverse of the restore registers function) is important!
        if (isSystemCall)
        {
            registersToSave.push(...RegistersAmd64Linux.syscallArguments);
            registersToSave.push(...RegistersAmd64Linux.syscallCallerSaved);
        }
        else
        {
            registersToSave.push(RegistersAmd64Linux.integerReturn);
            registersToSave.push(...RegistersAmd64Linux.arguments);
            registersToSave.push(...RegistersAmd64Linux.callerSaved);
        }

        for (const register of registersToSave)
        {
            if (this.registersInUse.has(register))
            {
                this.code.push(`push ${register.bit64}`);
            }
        }
    }

    protected restoreRegistersAfterFunctionCall (isSystemCall = false): void
    {
        const registersToSave: Register64[] = []; // TODO: Replace with a Set.

        // NOTE: The order of the registers (i.e. the reverse of the save registers function) is important!
        if (isSystemCall)
        {
            registersToSave.push(...RegistersAmd64Linux.syscallCallerSaved.reverse());
            registersToSave.push(...RegistersAmd64Linux.syscallArguments.reverse());
        }
        else
        {
            registersToSave.push(...RegistersAmd64Linux.callerSaved.reverse());
            registersToSave.push(...RegistersAmd64Linux.arguments.reverse());
            registersToSave.push(RegistersAmd64Linux.integerReturn);
        }

        for (const register of registersToSave)
        {
            if (this.registersInUse.has(register))
            {
                this.code.push(`pop ${register.bit64}`);
            }
        }
    }
}
