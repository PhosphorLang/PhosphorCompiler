import * as SemanticNodes from '../connector/semanticNodes';

export interface SemanticTreeTranspiler
{
    run (semanticTree: SemanticNodes.File): string;
}
