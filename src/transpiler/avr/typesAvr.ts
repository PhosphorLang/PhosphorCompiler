import BuildInTypes from "../../definitions/buildInTypes";
import TypeSemanticSymbol from "../../connector/semanticSymbols/typeSemanticSymbol";

export default abstract class TypesAvr
{
    public static getTypeSizeInBytes (type: TypeSemanticSymbol): number|null
    {
        switch (type)
        {
            case BuildInTypes.int:
            case BuildInTypes.bool:
                return 1;
            case BuildInTypes.string:
            default:
                return null;
        }
    }
}
