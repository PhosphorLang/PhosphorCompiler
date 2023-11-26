import { ParameterIndexToValue, ReturnIndexToValue } from './functionStack';

type StandardLibraryFunction = (callParameters: ParameterIndexToValue) => ReturnIndexToValue;

export class StandardLibrary
{
    public readonly functions: Map<string, StandardLibraryFunction>;

    constructor ()
    {
        this.functions = new Map();

        this.functions.set('Standard.Io.writeLine', Standard.io.writeLine);
    }
}

class Standard
{
    public static io = class
    {
        public static writeLine = (callParameters: ParameterIndexToValue): ReturnIndexToValue =>
        {
            const text = callParameters.get(0);

            console.log(text?.value);

            return new Map();
        };
    };
}
