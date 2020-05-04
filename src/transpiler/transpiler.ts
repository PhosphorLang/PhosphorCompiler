import * as SemanticNodes from "../connector/semanticNodes";

export default interface Transpiler
{
    run (semanticTree: SemanticNodes.File): string;
}
