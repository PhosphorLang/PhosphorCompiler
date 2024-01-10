import * as IntermediateSymbols from '../intermediateLowerer/intermediateSymbols';
import * as InterpreterValues from './interpreterValues';

export type ParameterIndexToValue = Map<number, InterpreterValues.Any>;
export type ReturnIndexToValue = Map<number, InterpreterValues.Any>;
export type VariablesMap = Map<IntermediateSymbols.Variable, InterpreterValues.Any>;

export class FunctionStack
{
    public takableParameters: ParameterIndexToValue;
    public givenParameters: ParameterIndexToValue;
    public returnValues: ReturnIndexToValue;
    public callResults: ReturnIndexToValue;

    public localVariables: VariablesMap;
    public compareOperands: [leftOperand: IntermediateSymbols.Variable, rightOperand: IntermediateSymbols.Variable] | null;

    constructor (takableParameters: ParameterIndexToValue = new Map())
    {
        this.takableParameters = takableParameters;
        this.givenParameters = new Map();
        this.returnValues = new Map();
        this.callResults = new Map();

        this.localVariables = new Map();
        this.compareOperands = null;
    }
}
