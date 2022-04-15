import * as Intermediates from '../../src/lowerer/intermediates';
import * as IntermediateSymbols from '../../src/lowerer/intermediateSymbols';
import { Defaults } from './defaults';
import { IntermediateSize } from '../../src/lowerer/intermediateSize';

export abstract class IntermediateCreator
{
    public static newFile (
        functions: Intermediates.Function[] = [],
        externals: Intermediates.External[] = [],
        constants: Intermediates.Constant[] = []
    ): Intermediates.File
    {
        return new Intermediates.File(functions, externals, constants);
    }

    public static newFunction (
        body: Intermediates.Statement[] = [IntermediateCreator.newReturn()],
        symbol = IntermediateCreator.newFunctionSymbol()
    ): Intermediates.Function
    {
        return new Intermediates.Function(symbol, body);
    }

    public static newFunctionSymbol (
        parameters: IntermediateSize[] = [],
        returnSize: IntermediateSize = IntermediateSize.Void,
        name = Defaults.identifier,
    ): IntermediateSymbols.Function
    {
        return new IntermediateSymbols.Function(name, returnSize, parameters);
    }

    public static newReturn (): Intermediates.Return
    {
        return new Intermediates.Return();
    }

    public static newCall (functionSymbol = IntermediateCreator.newFunctionSymbol()): Intermediates.Call
    {
        return new Intermediates.Call(functionSymbol);
    }

    public static newIntroduce (symbol = IntermediateCreator.newVariableSymbol()): Intermediates.Introduce
    {
        return new Intermediates.Introduce(symbol);
    }

    public static newVariableSymbol (name = 'v#0', size = IntermediateSize.Native): IntermediateSymbols.Variable
    {
        return new IntermediateSymbols.Variable(name, size);
    }

    public static newMove (
        to = IntermediateCreator.newVariableSymbol(),
        from: IntermediateSymbols.ReadableValue = IntermediateCreator.newLiteralSymbol()
    ): Intermediates.Move
    {
        return new Intermediates.Move(to, from);
    }

    public static newLiteralSymbol (value = Defaults.integer, size = IntermediateSize.Native): IntermediateSymbols.Literal
    {
        return new IntermediateSymbols.Literal(value, size);
    }

    public static newDismiss (symbol = IntermediateCreator.newVariableSymbol()): Intermediates.Dismiss
    {
        return new Intermediates.Dismiss(symbol);
    }

    public static newAdd (
        leftOperand = IntermediateCreator.newVariableSymbol(),
        rightOperand: IntermediateSymbols.Variable = IntermediateCreator.newVariableSymbol()
    ): Intermediates.Add
    {
        return new Intermediates.Add(leftOperand, rightOperand);
    }

    public static newConstant (symbol = IntermediateCreator.newConstantSymbol()): Intermediates.Constant
    {
        return new Intermediates.Constant(symbol);
    }

    public static newConstantSymbol (name = 'v#0', value = Defaults.string): IntermediateSymbols.Constant
    {
        return new IntermediateSymbols.Constant(name, value);
    }

    public static newGive (
        targetSymbol: IntermediateSymbols.Parameter|IntermediateSymbols.ReturnValue = IntermediateCreator.newParameterSymbol(),
        variable = IntermediateCreator.newVariableSymbol()
    ): Intermediates.Give
    {
        return new Intermediates.Give(targetSymbol, variable);
    }

    public static newParameterSymbol (index = 0, size = IntermediateSize.Native): IntermediateSymbols.Parameter
    {
        return new IntermediateSymbols.Parameter(index, size);
    }

    public static newTake (
        variableSymbol = IntermediateCreator.newVariableSymbol(),
        takableValue: IntermediateSymbols.Parameter|IntermediateSymbols.ReturnValue = IntermediateCreator.newReturnSymbol()
    ): Intermediates.Take
    {
        return new Intermediates.Take(variableSymbol, takableValue);
    }

    public static newReturnSymbol (size = IntermediateSize.Native, index = 0): IntermediateSymbols.ReturnValue
    {
        return new IntermediateSymbols.ReturnValue(index, size);
    }

    public static newExternal (functionSymbol = IntermediateCreator.newFunctionSymbol()): Intermediates.External
    {
        return new Intermediates.External(functionSymbol);
    }

    public static newCompare (
        leftOperand: IntermediateSymbols.Variable = IntermediateCreator.newVariableSymbol(),
        rightOperand: IntermediateSymbols.Variable = IntermediateCreator.newVariableSymbol()
    ): Intermediates.Compare
    {
        return new Intermediates.Compare(leftOperand, rightOperand);
    }

    public static newLabel (labelSymbol = IntermediateCreator.newLabelSymbol()): Intermediates.Label
    {
        return new Intermediates.Label(labelSymbol);
    }

    public static newLabelSymbol (name = 'l#0'): IntermediateSymbols.Label
    {
        return new IntermediateSymbols.Label(name);
    }

    public static newGoto (labelSymbol = IntermediateCreator.newLabelSymbol()): Intermediates.Goto
    {
        return new Intermediates.Goto(labelSymbol);
    }

    public static newJumpIfEqual (target = IntermediateCreator.newLabelSymbol()): Intermediates.JumpIfEqual
    {
        return new Intermediates.JumpIfEqual(target);
    }
}
