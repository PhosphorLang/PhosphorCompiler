import * as Intermediates from '../../src/intermediateLowerer/intermediates';
import * as IntermediateSymbols from '../../src/intermediateLowerer/intermediateSymbols';
import { Defaults } from './defaults';
import { IntermediateSize } from '../../src/intermediateLowerer/intermediateSize';

export abstract class IntermediateCreator
{
    public static newFile (
        functions: Intermediates.Function[] = [],
        externals: Intermediates.External[] = [],
        constants: Intermediates.Constant[] = [],
        globals: Intermediates.Global[] = [],
        structure: Intermediates.Structure = IntermediateCreator.newStructure(),
        isEntryPoint = false
    ): Intermediates.File
    {
        return new Intermediates.File(constants, externals, globals, functions, structure, isEntryPoint);
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
        name = Defaults.moduleName + '.' + Defaults.identifier,
    ): IntermediateSymbols.Function
    {
        return new IntermediateSymbols.Function(name, returnSize, parameters);
    }

    public static newStructure (
        symbol: IntermediateSymbols.Structure = IntermediateCreator.newStructureSymbol()
    ): Intermediates.Structure
    {
        return new Intermediates.Structure(symbol);
    }

    public static newStructureSymbol (
        name = Defaults.identifier,
        fields: IntermediateSymbols.Field[] = []
    ): IntermediateSymbols.Structure
    {
        return new IntermediateSymbols.Structure(name, fields);
    }

    public static newReturn (): Intermediates.Return
    {
        return new Intermediates.Return();
    }

    public static newCall (functionSymbol = IntermediateCreator.newFunctionSymbol()): Intermediates.Call
    {
        return new Intermediates.Call(functionSymbol);
    }

    public static newIntroduce (symbol = IntermediateCreator.newLocalVariableSymbol()): Intermediates.Introduce
    {
        return new Intermediates.Introduce(symbol);
    }

    public static newLocalVariableSymbol (index = 0, size = IntermediateSize.Native): IntermediateSymbols.LocalVariable
    {
        return new IntermediateSymbols.LocalVariable(index, size);
    }

    public static newMove (
        to = IntermediateCreator.newLocalVariableSymbol(),
        from: IntermediateSymbols.ReadableValue = IntermediateCreator.newLiteralSymbol()
    ): Intermediates.Move
    {
        return new Intermediates.Move(to, from);
    }

    public static newLiteralSymbol (value = Defaults.integer, size = IntermediateSize.Native): IntermediateSymbols.Literal
    {
        return new IntermediateSymbols.Literal(value, size);
    }

    public static newAdd (
        leftOperand = IntermediateCreator.newLocalVariableSymbol(),
        rightOperand: IntermediateSymbols.Variable = IntermediateCreator.newLocalVariableSymbol()
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
        variable = IntermediateCreator.newLocalVariableSymbol()
    ): Intermediates.Give
    {
        return new Intermediates.Give(targetSymbol, variable);
    }

    public static newParameterSymbol (index = 0, size = IntermediateSize.Native): IntermediateSymbols.Parameter
    {
        return new IntermediateSymbols.Parameter(index, size);
    }

    public static newTake (
        variableSymbol = IntermediateCreator.newLocalVariableSymbol(),
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
        leftOperand: IntermediateSymbols.Variable = IntermediateCreator.newLocalVariableSymbol(),
        rightOperand: IntermediateSymbols.Variable = IntermediateCreator.newLocalVariableSymbol()
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
