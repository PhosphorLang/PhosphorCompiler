import * as SemanticNodes from '../connector/semanticNodes';
import * as SemanticSymbols from '../connector/semanticSymbols';
import * as SpecialisedNodes from './specialisedNodes';

/**
 * Takes in a generic semantic tree and returns the specialised version of it
 * (i.e. the generic parameters are replaced with concrete types).
 */
export class Specialiser
{
    public run (fileSemanticNode: SemanticNodes.File, parameters: SemanticSymbols.ConcreteType[]): SpecialisedNodes.File
    {
        console.log(parameters.length);

        return fileSemanticNode;
    }
}
