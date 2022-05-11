import { SemanticSymbolKind } from "../semanticSymbolKind";
import { TypeSemanticSymbol } from "./typeSemanticSymbol";

export class ArrayTypeSemanticSymbol extends TypeSemanticSymbol
{
    public readonly elementType: TypeSemanticSymbol|null;
    /**
     * If the size is null, the array is of (at compile time) unknown size. \
     * TODO: Should an array with unknown size be a separate semantic symbol?
     * */
    public readonly size: number|null;

    constructor (elementType: TypeSemanticSymbol|null, size: number|null)
    {
        const sizeString = size === null ? '' :`${size}`;
        const elementTypeString = elementType === null ? '' :`${elementType.name}`;
        const name = `${elementTypeString}[${sizeString}]`;

        super(name);

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
            let sameElementType: boolean;
            if ((type.elementType === null) || (this.elementType === null))
            {
                sameElementType = type.elementType === this.elementType;
            }
            else
            {
                sameElementType = type.elementType.equals(this.elementType);
            }

            const sameSize = type.size === this.size;

            return sameSize && sameElementType;
        }
        else
        {
            return false;
        }
    }
}
