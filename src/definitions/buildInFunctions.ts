import * as SemanticSymbols from '../connector/semanticSymbols';
import { BuildInTypes } from './buildInTypes';
import { Namespace } from '../parser/namespace';

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
    public static readonly stringsAreEqual = new SemanticSymbols.Function(
        Namespace.constructFromStrings('Standard', 'String', 'stringsAreEqual'),
        BuildInTypes.boolean,
        [
            new SemanticSymbols.FunctionParameter(
                Namespace.constructFromStrings('Standard', 'String', 'stringsAreEqual', 'string1'),
                BuildInTypes.string
            ),
            new SemanticSymbols.FunctionParameter(
                Namespace.constructFromStrings('Standard', 'String', 'stringsAreEqual', 'string2'),
                BuildInTypes.string
            )
        ],
        null,
        true
    );

    public static readonly allocate = new SemanticSymbols.Function(
        Namespace.constructFromStrings('Standard', 'Memory', 'allocate'),
        BuildInTypes.pointer,
        [
            new SemanticSymbols.FunctionParameter(
                Namespace.constructFromStrings('Standard', 'Memory', 'allocate', 'size'),
                BuildInTypes.integer // FIXME: This should be UInt.
            )
        ],
        null,
        true
    );
}
