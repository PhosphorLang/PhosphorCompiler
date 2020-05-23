import BuildInTypes from "./buildInTypes";
import FunctionSemanticSymbol from "../connector/semanticSymbols/functionSemanticSymbol";
import ParameterSemanticSymbol from "../connector/semanticSymbols/parameterSemanticSymbol";

export default abstract class BuildInFunctions
{
    // TODO: In the long run, this will be replaced by the Standard Library. It will contain definitions for these functions.

    public static readonly readLine = new FunctionSemanticSymbol('readLine', BuildInTypes.string, []);
}
