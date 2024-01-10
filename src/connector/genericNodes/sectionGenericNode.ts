import { SemanticKind } from '../semanticKind';

export class SectionGenericNode <Statement>
{
    public readonly kind: SemanticKind.Section;

    public readonly statements: Statement[];

    constructor (statements: Statement[])
    {
        this.kind = SemanticKind.Section;

        this.statements = statements;
    }
}
