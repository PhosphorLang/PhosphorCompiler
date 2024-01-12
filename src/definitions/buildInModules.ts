import * as SemanticSymbols from '../connector/semanticSymbols';
import { BuildInFunctions } from './buildInFunctions';
import { Namespace } from '../parser/namespace';

export abstract class BuildInModules
{
    public static readonly string = new SemanticSymbols.Module(
        Namespace.constructFromStrings('Standard', 'String'),
        null,
        new Map(),
        new Map(
            [
                [BuildInFunctions.stringsAreEqual.namespace.qualifiedName, BuildInFunctions.stringsAreEqual]
            ]
        ),
        false
    );

    public static readonly memory = new SemanticSymbols.Module(
        Namespace.constructFromStrings('Standard', 'Memory'),
        null,
        new Map(),
        new Map(
            [
                [BuildInFunctions.allocate.namespace.qualifiedName, BuildInFunctions.allocate]
            ]
        ),
        false
    );
}
