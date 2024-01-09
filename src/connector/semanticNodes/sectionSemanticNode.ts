import * as SemanticNodes from '.';
import { SemanticKind } from '../semanticKind';

export class SectionSemanticNode
{
    public readonly kind: SemanticKind.Section;

    public statements: SemanticNodes.Statement[];

    constructor (statements: SemanticNodes.Statement[])
    {
        this.kind = SemanticKind.Section;

        this.statements = statements;
    }
}
