import { SemanticSymbolKind } from "../semanticSymbolKind";
import { TypeSemanticSymbol } from "./typeSemanticSymbol";

export class ArrayTypeSemanticSymbol extends TypeSemanticSymbol
{
    public readonly elementType: TypeSemanticSymbol;
    public readonly size: number;

    constructor (elementType: TypeSemanticSymbol, size: number)
    {
        super(`${elementType.name}[${size}]`);

        // The readonly property "kind" must be set in this child constructor but not setable somewhere else, so we cannot use a protected
        // setter or something similiar. And sadly the readonly modifier makes it read only in child constructors, too.
        // @ts-expect-error Reason: See above.
        this.kind = SemanticSymbolKind.ArrayType;

        this.elementType = elementType;
        this.size = size;
    }

    public override equals (type: TypeSemanticSymbol): boolean
    {
        if ((type.kind === this.kind) && (type instanceof ArrayTypeSemanticSymbol))
        {
            const sameSize = type.size === this.size;
            const sameElementType = type.elementType.equals(this.elementType);

            return sameSize && sameElementType;
        }
        else
        {
            return false;
        }
    }
}
