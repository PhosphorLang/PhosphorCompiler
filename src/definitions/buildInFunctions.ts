import BuildInTypes from "./buildInTypes";
import FunctionSemanticSymbol from "../connector/semanticSymbols/functionSemanticSymbol";
import ParameterSemanticSymbol from "../connector/semanticSymbols/parameterSemanticSymbol";

export default abstract class BuildInFunctions
{
    // TODO: In the long run, this will be replaced by the Standard Library. It will contain definitions for these functions.

    public static readonly writeLine = new FunctionSemanticSymbol(
        'writeLine',
        BuildInTypes.noType,
        [new ParameterSemanticSymbol('text', BuildInTypes.string)]
    );
    public static readonly readLine = new FunctionSemanticSymbol('readLine', BuildInTypes.string, []);

    public static readonly stringToInt = new FunctionSemanticSymbol(
        'stringToInt',
        BuildInTypes.int,
        [new ParameterSemanticSymbol('string', BuildInTypes.string)]
    );
    public static readonly intToString = new FunctionSemanticSymbol(
        'intToString',
        BuildInTypes.string,
        [new ParameterSemanticSymbol('integer', BuildInTypes.int)]
    );

    public static readonly stringsAreEqual = new FunctionSemanticSymbol(
        'stringsAreEqual',
        BuildInTypes.bool,
        [
            new ParameterSemanticSymbol('string1', BuildInTypes.string),
            new ParameterSemanticSymbol('string2', BuildInTypes.string)
        ]
    );

    public static readonly randomise = new FunctionSemanticSymbol('randomise', BuildInTypes.noType, []);
    public static readonly getRandom = new FunctionSemanticSymbol(
        'getRandom',
        BuildInTypes.int,
        [new ParameterSemanticSymbol('range', BuildInTypes.int)]
    );

    public static functions: FunctionSemanticSymbol[] = [
        BuildInFunctions.writeLine,
        BuildInFunctions.readLine,
        BuildInFunctions.stringToInt,
        BuildInFunctions.intToString,
        BuildInFunctions.randomise,
        BuildInFunctions.getRandom,
        BuildInFunctions.stringsAreEqual,
    ];
}
