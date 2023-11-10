import { BuildInTypes } from './buildInTypes';
import { FunctionParameterSemanticSymbol } from '../connector/semanticSymbols/functionParameterSemanticSymbol';
import { FunctionSemanticSymbol } from '../connector/semanticSymbols/functionSemanticSymbol';

/**
 * This class contains all functions that the compiler may insert and thus expects them to be present. These are especially functions
 * that are provided by the standard library but may be not exposed to the user in the header files.
 *
 * NOTE: This is NOT a full list of all functions that must be present for the compiler to work. In later stages of the compilation,
 *       such as in the transpiling phase, calls to other functions (most notably "exit") can be inserted that have no reference here.
 *
 * TODO: It would be great if this would indeed be an exhaustive list of all expected functions.
 */
export abstract class BuildInFunctions
{
    public static readonly stringsAreEqual = new FunctionSemanticSymbol(
        'stringsAreEqual',
        BuildInTypes.bool,
        [
            new FunctionParameterSemanticSymbol('string1', BuildInTypes.string),
            new FunctionParameterSemanticSymbol('string2', BuildInTypes.string)
        ],
        true
    );
}
