import { Namespace } from '../../parser/namespace';

export abstract class GenericSymbolBase
{
    public readonly namespace: Namespace;

    constructor (namespace: Namespace)
    {
        this.namespace = namespace;
    }

    public equals (other: GenericSymbolBase): boolean
    {
        return this.namespace.qualifiedName === other.namespace.qualifiedName;
    }
}
