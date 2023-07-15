import { BuildInFunctions } from './buildInFunctions';
import { ModuleSemanticSymbol } from '../connector/semanticSymbols/moduleSemanticSymbol';

export abstract class BuildInModules
{
    public static readonly string = new ModuleSemanticSymbol(
        'String',
        'Standard.String',
        'Standard.String',
        new Map(
            [
                [BuildInFunctions.stringsAreEqual.name, BuildInFunctions.stringsAreEqual]
            ]
        ),
        false
    );
}
