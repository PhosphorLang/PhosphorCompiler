import { ConcreteTypeSemanticSymbol } from './concreteTypeSemanticSymbol';
import { SemanticSymbolKind } from '../semanticSymbolKind';
import { VariableSemanticSymbol } from './variableSemanticSymbol';

export class FieldSemanticSymbol extends VariableSemanticSymbol
{
    constructor (name: string, type: ConcreteTypeSemanticSymbol, isReadonly: boolean)
    {
        super(name, type, isReadonly);

        // The readonly property "kind" must be set in this child constructor but not setable somewhere else, so we cannot use a protected
        // setter or something similiar. And sadly the readonly modifier makes it read only in child constructors, too.
        // @ts-expect-error Reason: See above.
        this.kind = SemanticSymbolKind.Field;
    }
}
