import { ConcreteTypeSemanticSymbol } from './concreteTypeSemanticSymbol';
import { FunctionParameterSemanticSymbol } from './functionParameterSemanticSymbol';
import { SemanticSymbol } from './semanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';

export class FunctionSemanticSymbol extends SemanticSymbol
{
    public readonly parameters: FunctionParameterSemanticSymbol[];
    public readonly returnType: ConcreteTypeSemanticSymbol;
    public readonly isHeader: boolean;

    constructor (name: string, returnType: ConcreteTypeSemanticSymbol, parameters: FunctionParameterSemanticSymbol[], isHeader: boolean)
    {
        super(SemanticSymbolKind.Function, name);

        this.returnType = returnType;
        this.parameters = parameters;
        this.isHeader = isHeader;
    }
}
