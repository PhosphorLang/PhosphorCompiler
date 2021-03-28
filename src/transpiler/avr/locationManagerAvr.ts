import * as Instructions from "../common/instructions";
import * as SemanticSymbols from "../../connector/semanticSymbols";
import Instruction from "../common/instructions/instruction";
import LocationedVariableAvr from "./locationedVariableAvr";
import RegisterAvr from "./registers/registerAvr";
import RegistersAvr from "./registersAvr";
import TypesAvr from "./typesAvr";

type VariableStack = Map<SemanticSymbols.Variable, LocationedVariableAvr>;

export default class LocationManagerAvr
{
    public instructions: Instruction[];

    /**
     * A list of variable lists, working as a stack.
     * At the beginning of each function and section a new list is pushed, at the end of them it is removed.
     * With this we keep track of which variables are used at which point in the code.
     */
    private variableStacks: VariableStack[];

    /**
     * The set of registers currently in use.
     */
    private registersInUse: Map<RegisterAvr, LocationedVariableAvr>;

    // TODO: As we make a lookup on this array, it should become a set:
    private savedRegisters: RegisterAvr[];

    private get lastVariableStack (): VariableStack
    {
        const lastVariableStack = this.variableStacks[this.variableStacks.length - 1];

        return lastVariableStack;
    }

    constructor (instructions: Instruction[])
    {
        this.instructions = instructions;

        this.variableStacks = [];
        this.registersInUse = new Map<RegisterAvr, LocationedVariableAvr>();
        this.savedRegisters = [];
    }

    private getNextFreeRegister (): RegisterAvr|null
    {
        const registers = RegistersAvr.freeUse;

        for (const register of registers)
        {
            if (!this.registersInUse.has(register))
            {
                /* FIXME: It is very bad that this function is half-destructive.
                          It saves the register but you have to put it into registersInUse manually... */
                this.saveRegisterIfNeeded(register);

                return register;
            }
        }

        return null;
    }

    private saveRegisterIfNeeded (register: RegisterAvr): void
    {
        if (!this.savedRegisters.includes(register))
        {
            this.instructions.push(
                new Instructions.SingleOperand('push', register.name),
            );

            this.savedRegisters.push(register);
        }
    }

    public enterFunction (): void
    {
        this.enterSection();
    }

    public leaveFunction (): void
    {
        this.leaveSection();

        // Restore all saved registers:
        for (const register of this.savedRegisters)
        {
            this.instructions.push(
                new Instructions.SingleOperand('pop', register.name),
            );
        }

        this.savedRegisters = [];

        this.registersInUse.clear();
    }

    public enterSection (): void
    {
        const newStack = new Map<SemanticSymbols.Variable, LocationedVariableAvr>();

        this.variableStacks.push(newStack);
    }

    public leaveSection (): void
    {
        this.variableStacks.pop();
    }

    public registerParameter (parameter: SemanticSymbols.Parameter, registers: RegisterAvr[]): LocationedVariableAvr
    {
        return this.registerVariable(parameter, registers);
    }

    public registerVariable (variable: SemanticSymbols.Variable, registers: RegisterAvr[]): LocationedVariableAvr
    {
        const locationedVariable = new LocationedVariableAvr(variable, registers);

        this.lastVariableStack.set(variable, locationedVariable);

        for (const register of registers)
        {
            this.registersInUse.set(register, locationedVariable);
        }

        return locationedVariable;
    }

    public createVariable (variable: SemanticSymbols.Variable): LocationedVariableAvr
    {
        const variableSize = TypesAvr.getTypeSizeInBytes(variable.type);

        if (variableSize === null)
        {
            throw new Error(`Transpiler error: The variable type "${variable.type.name}" is not supported.`);
        }

        const registers = [];
        for (let i = 0; i < variableSize; i++)
        {
            const freeRegister = this.getNextFreeRegister();

            if (freeRegister === null)
            {
                throw new Error('Transpiler error: Too many variables (Stack variables are not supported).');
            }

            registers.push(freeRegister);
        }

        const locationedVariable = this.registerVariable(variable, registers);

        for (const register of registers)
        {
            this.registersInUse.set(register, locationedVariable);
        }

        return locationedVariable;
    }

    public freeVariable (locationedVariable: LocationedVariableAvr): void
    {
        // Delete the variable from the variable stack:
        for (const variableStack of this.variableStacks)
        {
            if (variableStack.has(locationedVariable.variable))
            {
                variableStack.delete(locationedVariable.variable);

                break;
            }
        }

        // Remove the variable's registers from the in use table:
        for (const register of locationedVariable.location)
        {
            this.registersInUse.delete(register);
        }
    }

    public getVariableLocation (variable: SemanticSymbols.Variable): LocationedVariableAvr
    {
        for (const variableStack of this.variableStacks.slice().reverse())
        {
            const locationedVariable = variableStack.get(variable);

            if (locationedVariable !== undefined)
            {
                return locationedVariable;
            }
        }

        throw new Error(`Transpiler error: The given variable "${variable.name}" is unknown.`);
    }

    /**
     * Out of the argument registers, get the first "count" number, free and return them.
     * @param count The number of needed registers (the same as the size in bytes).
     */
    public getFreeArgumentRegisters (count: number): RegisterAvr[]
    {
        return this.getFreeRegisters(count, RegistersAvr.argumentValues);
    }

    /**
     * Out of the return registers, get the first "count" number, free and return them.
     * @param count The number of needed registers (the same as the size in bytes).
     */
    public getFreeReturnRegisters (count: number): RegisterAvr[]
    {
        return this.getFreeRegisters(count, RegistersAvr.returnValue);
    }

    /**
     * Out of the constant loadable registers, get the first "count" number, free and return them.
     * @param count The number of needed registers (the same as the size in bytes).
     */
    public getFreeConstantLoadableRegisters (count: number): RegisterAvr[]
    {
        return this.getFreeRegisters(count, RegistersAvr.constantLoadable);
    }

    /**
     * Out of a pool of registers, get the first "count" number, free and return them.
     * @param count The number of registers to free.
     * @param pool The pool that the registers come from.
     */
    private getFreeRegisters (count: number, pool: RegisterAvr[]): RegisterAvr[]
    {
        const returnRegisters: RegisterAvr[] = [];
        for (let i = 0; i < count; i++)
        {
            const returnRegister = pool[i];
            returnRegisters.push(returnRegister);
        }

        this.freeRegistersIfNeeded(returnRegisters);

        return returnRegisters;
    }

    private freeRegistersIfNeeded (registers: RegisterAvr[]): void
    {
        const registersToFree: RegisterAvr[] = [];
        const freeRegisters: RegisterAvr[] = [];

        for (const register of registers)
        {
            if (!this.registersInUse.has(register))
            {
                this.saveRegisterIfNeeded(register);

                continue;
            }

            registersToFree.push(register);

            const freeRegister = this.getNextFreeRegister();

            if (freeRegister === null)
            {
                throw new Error('Transpiler error: Cannot move variable, no free register available (Stack variables are not supported).');
            }

            freeRegisters.push(freeRegister);
        }

        for (let i = 0; i < registersToFree.length; i++)
        {
            const oldRegister = registersToFree[i];
            const newRegister = freeRegisters[i];

            const locationedVariable = this.registersInUse.get(oldRegister);

            if (locationedVariable === undefined)
            {
                continue;
            }

            this.instructions.push(
                new Instructions.DoubleOperand('mov', newRegister.name, oldRegister.name),
            );

            for (let j = 0; j < locationedVariable.location.length; j++)
            {
                if (locationedVariable.location[j] === oldRegister)
                {
                    locationedVariable.location[j] = newRegister;
                }
            }

            this.registersInUse.delete(oldRegister);
            this.registersInUse.set(newRegister, locationedVariable);
        }
    }
}
