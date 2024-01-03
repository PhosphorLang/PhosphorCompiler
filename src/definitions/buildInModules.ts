import { BuildInFunctions } from './buildInFunctions';
import { ModuleSemanticSymbol } from '../connector/semanticSymbols/moduleSemanticSymbol';

export abstract class BuildInModules
{
    public static readonly string = new ModuleSemanticSymbol(
        'String',
        'Standard.String',
        'Standard.String',
        null,
        new Map(),
        new Map(
            [
                [BuildInFunctions.stringsAreEqual.name, BuildInFunctions.stringsAreEqual]
            ]
        ),
        false
    );

    public static readonly memory = new ModuleSemanticSymbol(
        'Memory',
        'Standard.Memory',
        'Standard.Memory',
        null,
        new Map(),
        new Map(
            [
                [BuildInFunctions.allocate.name, BuildInFunctions.allocate]
            ]
        ),
        false
    );
}
