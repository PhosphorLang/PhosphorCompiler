import { IntermediateSize } from '../intermediateSize';
import { IntermediateSymbolBase } from './intermediateSymbolBase';
import { IntermediateSymbolKind } from '../intermediateSymbolKind';

export class FunctionIntermediateSymbol extends IntermediateSymbolBase
{
    public readonly kind: IntermediateSymbolKind.Function;

    public readonly parameters: IntermediateSize[];
    public readonly returnSize: IntermediateSize;

    constructor (name: string, returnSize: IntermediateSize, parameters: IntermediateSize[])
    {
        super(name);

        this.kind = IntermediateSymbolKind.Function;

        this.returnSize = returnSize;
        this.parameters = parameters;
    }
}
