import { SemanticSymbolKind } from '../semanticSymbolKind';
import { TypeSemanticSymbol } from './typeSemanticSymbol';
import { VariableSemanticSymbol } from './variableSemanticSymbol';

export class ParameterSemanticSymbol extends VariableSemanticSymbol
{
    constructor (name: string, type: TypeSemanticSymbol)
    {
        super(name, type, true);

        // The readonly property "kind" must be set in this child constructor but not setable somewhere else, so we cannot use a protected
        // setter or something similiar. And sadly the readonly modifier makes it read only in child constructors, too.
        // @ts-expect-error Reason: See above.
        this.kind = SemanticSymbolKind.Parameter;
    }
}
