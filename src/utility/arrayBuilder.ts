/**
 * The array builder contains a list of references to arrays. \
 * The current reference is the last array in the list. \
 * The array builder can be used to build a single array non-linearly by saving references, adding new ones and later write to the saved
 * one.
 */
export class ArrayBuilder<ElementType>
{
    private references: ElementType[][];

    /**
     * The current reference is the last array in the list.
     */
    public get currentReference (): ElementType[]
    {
        return this.references[this.references.length - 1];
    }

    public get lastElement (): ElementType | null
    {
        const currentReference = this.currentReference;

        if (currentReference.length === 0)
        {
            return null;
        }
        else
        {
            return currentReference[currentReference.length - 1];
        }
    }

    constructor ()
    {
        this.references = [[]];
    }

    /**
     * Add another element to the builder by pushing it to the latest reference's array.
     */
    public push (...elements: ElementType[]): void
    {
        this.currentReference.push(...elements);
    }

    /**
     * Add a new reference to the builder. The added reference can afterwards be accessed by the {@link currentReference} property.
     */
    public addNewReference (): void
    {
        this.references.push([]);
    }

    public clear (): void
    {
        this.references = [[]];
    }

    /**
     * Concatenates all references into a single array and returns it.
     */
    public toArray (): ElementType[]
    {
        const result: ElementType[] = [];

        for (const array of this.references)
        {
            result.push(...array);
        }

        return result;
    }
}
