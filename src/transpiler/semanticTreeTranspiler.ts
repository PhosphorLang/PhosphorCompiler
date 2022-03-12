import * as SemanticNodes from '../connector/semanticNodes';

export default interface SemanticTreeTranspiler
{
    run (semanticTree: SemanticNodes.File): string;
}
