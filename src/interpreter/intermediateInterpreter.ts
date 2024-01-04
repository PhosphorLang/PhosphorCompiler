import * as Intermediates from '../lowerer/intermediates';
import * as IntermediateSymbols from '../lowerer/intermediateSymbols';
import * as InterpreterValues from './interpreterValues';
import { FunctionStack, ParameterIndexToValue, ReturnIndexToValue } from './functionStack';
import { IntermediateKind } from '../lowerer/intermediateKind';
import { IntermediateSymbolKind } from '../lowerer/intermediateSymbolKind';
import { StandardLibrary } from './standardLibrary';

/**
 * The Intermediate Interpreter runs the intermediate instructions.
 */
export class IntermediateInterpreter
{
    // Global symbols:
    private entryPoint: Intermediates.Function|null;
    private functions: Map<IntermediateSymbols.Function, Intermediates.Function>;
    private constants: Map<IntermediateSymbols.Constant, Intermediates.Constant>;

    private standardLibrary: StandardLibrary;

    /** Maps the label symbol to the statement index. Note that this is function-local. */
    private labelToStatementIndex: Map<IntermediateSymbols.Label, number>;

    constructor ()
    {
        this.entryPoint = null;
        this.functions = new Map();
        this.constants = new Map();
        this.labelToStatementIndex = new Map();

        this.standardLibrary = new StandardLibrary();
    }

    public run (files: Intermediates.File[]): void
    {
        for (const file of files)
        {
            this.loadFile(file);
        }

        if (this.entryPoint === null)
        {
            throw new Error('Intermediate Interpreter error: No entry point found.');
        }

        this.interpretFunction(this.entryPoint, new Map());

        this.entryPoint = null;
        this.functions.clear();
        this.constants.clear();
        this.labelToStatementIndex.clear();
    }

    private loadFile (file: Intermediates.File): void
    {
        for (const functionfileIntermediate of file.functions)
        {
            this.loadFunction(functionfileIntermediate, file.isEntryPoint);
        }

        for (const constantIntermediate of file.constants)
        {
            this.constants.set(constantIntermediate.symbol, constantIntermediate);
        }
    }

    private loadFunction (functionIntermediate: Intermediates.Function, fileIsEntryPoint: boolean): void
    {
        this.functions.set(functionIntermediate.symbol, functionIntermediate);

        if (fileIsEntryPoint && (this.entryPoint == null) && (functionIntermediate.symbol.name == 'main'))
        {
            this.entryPoint = functionIntermediate;
        }

        for (let index = 0; index < functionIntermediate.body.length; index++)
        {
            const statement = functionIntermediate.body[index];

            if (statement.kind == IntermediateKind.Label)
            {
                this.labelToStatementIndex.set(statement.symbol, index);
            }
        }
    }

    private interpretFunction (functionIntermediate: Intermediates.Function, callParameters: ParameterIndexToValue): ReturnIndexToValue
    {
        const functionStack = new FunctionStack(callParameters);

        let statementIndex = 0;
        while (statementIndex < functionIntermediate.body.length)
        {
            const statement = functionIntermediate.body[statementIndex];
            const statementConsequence = this.interpretStatement(statement, functionStack);

            if (statementConsequence instanceof IntermediateSymbols.Label)
            {
                const labelStatementIndex = this.labelToStatementIndex.get(statementConsequence);

                if (labelStatementIndex === undefined)
                {
                    throw new Error(`Intermediate Interpreter error: Label "${statementConsequence.name}" not found.`);
                }

                statementIndex = labelStatementIndex; // NOTE: Will be incremented at the end of the loop.
            }
            else if (statementConsequence)
            {
                break;
            }

            statementIndex += 1;
        }

        return functionStack.returnValues;
    }

    /**
     * Interpret the given statement.
     * @returns A label symbol if a jump is necessary, true if the statement was a return statement, false if there is nothing to do.
     */
    private interpretStatement (statementIntermediate: Intermediates.Statement, functionStack: FunctionStack):
        IntermediateSymbols.Label|boolean
    {
        switch (statementIntermediate.kind)
        {
            case IntermediateKind.Add:
                this.interpretAdd(statementIntermediate, functionStack);
                break;
            case IntermediateKind.And:
                this.interpretAnd(statementIntermediate, functionStack);
                break;
            case IntermediateKind.Call:
                this.interpretCall(statementIntermediate, functionStack);
                break;
            case IntermediateKind.Compare:
                this.interpretCompare(statementIntermediate, functionStack);
                break;
            case IntermediateKind.Dismiss:
                // Ignored.
                break;
            case IntermediateKind.Divide:
                this.interpretDivide(statementIntermediate, functionStack);
                break;
            case IntermediateKind.Give:
                this.interpretGive(statementIntermediate, functionStack);
                break;
            case IntermediateKind.Goto:
                return this.interpretGoto(statementIntermediate);
            case IntermediateKind.Introduce:
                // Nothing to do.
                break;
            case IntermediateKind.JumpIfEqual:
                return this.interpretJumpIfEqual(statementIntermediate, functionStack) ?? false;
            case IntermediateKind.JumpIfGreater:
                return this.interpretJumpIfGreater(statementIntermediate, functionStack) ?? false;
            case IntermediateKind.JumpIfLess:
                return this.interpretJumpIfLess(statementIntermediate, functionStack) ?? false;
            case IntermediateKind.JumpIfNotEqual:
                return this.interpretJumpIfNotEqual(statementIntermediate, functionStack) ?? false;
            case IntermediateKind.Label:
                // Nothing to do.
                break;
            case IntermediateKind.Move:
                this.interpretMove(statementIntermediate, functionStack);
                break;
            case IntermediateKind.Modulo:
                this.interpretModulo(statementIntermediate, functionStack);
                break;
            case IntermediateKind.Multiply:
                this.interpretMultiply(statementIntermediate, functionStack);
                break;
            case IntermediateKind.Negate:
                this.interpretNegate(statementIntermediate, functionStack);
                break;
            case IntermediateKind.Not:
                this.interpretNot(statementIntermediate, functionStack);
                break;
            case IntermediateKind.Or:
                this.interpretOr(statementIntermediate, functionStack);
                break;
            case IntermediateKind.Return:
                return true;
            case IntermediateKind.Subtract:
                this.interpretSubtract(statementIntermediate, functionStack);
                break;
            case IntermediateKind.Take:
                this.interpretTake(statementIntermediate, functionStack);
                break;
        }

        return false;
    }

    private interpretAdd (addIntermediate: Intermediates.Add, functionStack: FunctionStack): void
    {
        const leftValue = this.getVariableFromStack(addIntermediate.leftOperand, functionStack);
        const rightValue = this.getVariableFromStack(addIntermediate.rightOperand, functionStack);

        if (!(leftValue instanceof InterpreterValues.Int) || !(rightValue instanceof InterpreterValues.Int))
        {
            throw new Error('Intermediate Interpreter error: Add operands must be integers.');
        }

        leftValue.value = leftValue.value + rightValue.value;
    }

    private interpretAnd (andIntermediate: Intermediates.And, functionStack: FunctionStack): void
    {
        const leftValue = this.getVariableFromStack(andIntermediate.leftOperand, functionStack);
        const rightValue = this.getVariableFromStack(andIntermediate.rightOperand, functionStack);

        if (!(leftValue instanceof InterpreterValues.Int) || !(rightValue instanceof InterpreterValues.Int))
        {
            throw new Error('Intermediate Interpreter error: And operands must be integers.');
        }

        const andResult = (leftValue.value != 0n) && (rightValue.value != 0n);

        leftValue.value = andResult ? 1n : -1n;
    }

    private interpretCall (callIntermediate: Intermediates.Call, functionStack: FunctionStack): void
    {
        const fileIntermediate = this.functions.get(callIntermediate.functionSymbol);

        if (fileIntermediate !== undefined)
        {
            const callParameters = functionStack.givenParameters;
            functionStack.callResults = this.interpretFunction(fileIntermediate, callParameters);
        }
        else
        {
            const standardLibraryFunction = this.standardLibrary.functions.get(callIntermediate.functionSymbol.name);

            if (standardLibraryFunction !== undefined)
            {
                const callParameters = functionStack.givenParameters;
                functionStack.callResults = standardLibraryFunction(callParameters);
            }
            else
            {
                throw new Error(`Intermediate Interpreter error: Function "${callIntermediate.functionSymbol.name}" not found.`);
            }
        }
    }

    private interpretCompare (compareIntermediate: Intermediates.Compare, functionStack: FunctionStack): void
    {
        if (functionStack.compareOperands !== null)
        {
            throw new Error('Intermediate Interpreter error: Cannot compare because another compare is already in progress.');
        }

        functionStack.compareOperands = [
            compareIntermediate.leftOperand,
            compareIntermediate.rightOperand,
        ];
    }

    private interpretDivide (divideIntermediate: Intermediates.Divide, functionStack: FunctionStack): void
    {
        const leftValue = this.getVariableFromStack(divideIntermediate.leftOperand, functionStack);
        const rightValue = this.getVariableFromStack(divideIntermediate.rightOperand, functionStack);

        if (!(leftValue instanceof InterpreterValues.Int) || !(rightValue instanceof InterpreterValues.Int))
        {
            throw new Error('Intermediate Interpreter error: Divide operands must be integers.');
        }

        leftValue.value = leftValue.value / rightValue.value;
    }

    private interpretGive (giveIntermediate: Intermediates.Give, functionStack: FunctionStack): void
    {
        const variableValue = this.getVariableFromStack(giveIntermediate.variable, functionStack);

        switch (giveIntermediate.targetSymbol.kind)
        {
            case IntermediateSymbolKind.Parameter:
                functionStack.givenParameters.set(giveIntermediate.targetSymbol.index, variableValue);
                break;
            case IntermediateSymbolKind.ReturnValue:
                functionStack.returnValues.set(giveIntermediate.targetSymbol.index, variableValue);
                break;
        }
    }

    private interpretGoto (gotoIntermediate: Intermediates.Goto): IntermediateSymbols.Label
    {
        return gotoIntermediate.target;
    }

    private interpretJumpIfEqual (jumpIfEqualIntermediate: Intermediates.JumpIfEqual, functionStack: FunctionStack):
        IntermediateSymbols.Label|null
    {
        const [leftValue, rightValue] = this.getComparisonOperandValues(functionStack);

        if (leftValue.value == rightValue.value)
        {
            return jumpIfEqualIntermediate.target;
        }
        else
        {
            return null;
        }
    }

    private interpretJumpIfGreater (jumpIfGreaterIntermediate: Intermediates.JumpIfGreater, functionStack: FunctionStack):
        IntermediateSymbols.Label|null
    {
        const [leftValue, rightValue] = this.getComparisonOperandValues(functionStack);

        if (leftValue.value > rightValue.value)
        {
            return jumpIfGreaterIntermediate.target;
        }
        else
        {
            return null;
        }
    }

    private interpretJumpIfLess (jumpIfLessIntermediate: Intermediates.JumpIfLess, functionStack: FunctionStack):
        IntermediateSymbols.Label|null
    {
        const [leftValue, rightValue] = this.getComparisonOperandValues(functionStack);

        if (leftValue.value < rightValue.value)
        {
            return jumpIfLessIntermediate.target;
        }
        else
        {
            return null;
        }
    }

    private interpretJumpIfNotEqual (jumpIfNotEqualIntermediate: Intermediates.JumpIfNotEqual, functionStack: FunctionStack):
        IntermediateSymbols.Label|null
    {
        const [leftValue, rightValue] = this.getComparisonOperandValues(functionStack);

        if (leftValue.value != rightValue.value)
        {
            return jumpIfNotEqualIntermediate.target;
        }
        else
        {
            return null;
        }
    }

    private getComparisonOperandValues (functionStack: FunctionStack): [leftValue: InterpreterValues.Int, rightValue: InterpreterValues.Int]
    {
        if (functionStack.compareOperands === null)
        {
            throw new Error('Intermediate Interpreter error: Cannot jump because no compare is in progress.');
        }
        const [leftOperand, rightOperand] = functionStack.compareOperands;

        const leftValue = this.getVariableFromStack(leftOperand, functionStack);
        const rightValue = this.getVariableFromStack(rightOperand, functionStack);

        if (!(leftValue instanceof InterpreterValues.Int) || !(rightValue instanceof InterpreterValues.Int))
        {
            throw new Error('Intermediate Interpreter error: Comparison operands must be integers.');
        }

        return [leftValue, rightValue];
    }

    private interpretMove (moveIntermediate: Intermediates.Move, functionStack: FunctionStack): void
    {
        switch (moveIntermediate.from.kind)
        {
            case IntermediateSymbolKind.Literal:
            {
                const value = new InterpreterValues.Int(moveIntermediate.from);

                functionStack.localVariables.set(moveIntermediate.to, value);

                break;
            }
            case IntermediateSymbolKind.Constant:
            {
                const value = new InterpreterValues.String(moveIntermediate.from);

                functionStack.localVariables.set(moveIntermediate.to, value);

                break;
            }
            case IntermediateSymbolKind.LocalVariable:
            {
                const value = this.getVariableFromStack(moveIntermediate.from, functionStack);

                functionStack.localVariables.set(moveIntermediate.to, value);

                break;
            }
            case IntermediateSymbolKind.GlobalVariable:
            {
                // TODO: Implement.
                throw new Error('Intermediate Interpreter error: Move of a global variable is not implemented yet.');
            }
            break;
        }
    }

    private interpretModulo (moduloIntermediate: Intermediates.Modulo, functionStack: FunctionStack): void
    {
        const leftValue = this.getVariableFromStack(moduloIntermediate.leftOperand, functionStack);
        const rightValue = this.getVariableFromStack(moduloIntermediate.rightOperand, functionStack);

        if (!(leftValue instanceof InterpreterValues.Int) || !(rightValue instanceof InterpreterValues.Int))
        {
            throw new Error('Intermediate Interpreter error: Modulo operands must be integers.');
        }

        leftValue.value = leftValue.value % rightValue.value;
    }

    private interpretMultiply (multiplyIntermediate: Intermediates.Multiply, functionStack: FunctionStack): void
    {
        const leftValue = this.getVariableFromStack(multiplyIntermediate.leftOperand, functionStack);
        const rightValue = this.getVariableFromStack(multiplyIntermediate.rightOperand, functionStack);

        if (!(leftValue instanceof InterpreterValues.Int) || !(rightValue instanceof InterpreterValues.Int))
        {
            throw new Error('Intermediate Interpreter error: Multiply operands must be integers.');
        }

        leftValue.value = leftValue.value * rightValue.value;
    }

    private interpretNegate (negateIntermediate: Intermediates.Negate, functionStack: FunctionStack): void
    {
        const value = this.getVariableFromStack(negateIntermediate.operand, functionStack);

        if (!(value instanceof InterpreterValues.Int))
        {
            throw new Error('Intermediate Interpreter error: Negate operand must be an integer.');
        }

        value.value = -value.value;
    }

    private interpretNot (notIntermediate: Intermediates.Not, functionStack: FunctionStack): void
    {
        const value = this.getVariableFromStack(notIntermediate.operand, functionStack);

        if (!(value instanceof InterpreterValues.Int))
        {
            throw new Error('Intermediate Interpreter error: Not operand must be an integer.');
        }

        if (value.value == 0n)
        {
            value.value = -1n;
        }
        else
        {
            value.value = 0n;
        }
    }

    private interpretOr (orIntermediate: Intermediates.Or, functionStack: FunctionStack): void
    {
        const leftValue = this.getVariableFromStack(orIntermediate.leftOperand, functionStack);
        const rightValue = this.getVariableFromStack(orIntermediate.rightOperand, functionStack);

        if (!(leftValue instanceof InterpreterValues.Int) || !(rightValue instanceof InterpreterValues.Int))
        {
            throw new Error('Intermediate Interpreter error: Or operands must be integers.');
        }

        const orResult = (leftValue.value != 0n) || (rightValue.value != 0n);

        leftValue.value = orResult ? 1n : -1n;
    }

    private interpretSubtract (subtractIntermediate: Intermediates.Subtract, functionStack: FunctionStack): void
    {
        const leftValue = this.getVariableFromStack(subtractIntermediate.leftOperand, functionStack);
        const rightValue = this.getVariableFromStack(subtractIntermediate.rightOperand, functionStack);

        if (!(leftValue instanceof InterpreterValues.Int) || !(rightValue instanceof InterpreterValues.Int))
        {
            throw new Error('Intermediate Interpreter error: Subtract operands must be integers.');
        }

        leftValue.value = leftValue.value - rightValue.value;
    }

    private interpretTake (takeIntermediate: Intermediates.Take, functionStack: FunctionStack): void
    {
        switch (takeIntermediate.takableValue.kind)
        {
            case IntermediateSymbolKind.Parameter:
            {
                const parameterValue = functionStack.takableParameters.get(takeIntermediate.takableValue.index);

                if (parameterValue === undefined)
                {
                    throw new Error(`Intermediate Interpreter error: Parameter "${takeIntermediate.takableValue.name}" not found.`);
                }

                functionStack.localVariables.set(takeIntermediate.variableSymbol, parameterValue);

                break;
            }
            case IntermediateSymbolKind.ReturnValue:
            {
                const returnValueValue = functionStack.callResults.get(takeIntermediate.takableValue.index);

                if (returnValueValue === undefined)
                {
                    throw new Error(`Intermediate Interpreter error: Return value "${takeIntermediate.takableValue.name}" not found.`);
                }

                functionStack.localVariables.set(takeIntermediate.variableSymbol, returnValueValue);

                break;
            }
        }
    }

    private getVariableFromStack (variableSymbol: IntermediateSymbols.Variable, functionStack: FunctionStack): InterpreterValues.Any
    {
        const variableValue = functionStack.localVariables.get(variableSymbol);

        if (variableValue === undefined)
        {
            throw new Error(`Intermediate Interpreter error: Variable "${variableSymbol.name}" not found.`);
        }

        return variableValue;
    }
}
