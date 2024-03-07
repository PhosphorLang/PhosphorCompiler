import { Namespace } from '../../parser/namespace';

export abstract class SemanticSymbolBase
{
    public readonly namespace: Namespace;

    constructor (namespace: Namespace)
    {
        this.namespace = namespace;
    }

    public equals (other: SemanticSymbolBase): boolean
    {
        return this.namespace.qualifiedName === other.namespace.qualifiedName;
    }
}
