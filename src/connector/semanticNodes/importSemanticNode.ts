import { FileSemanticNode } from './fileSemanticNode';
import { SemanticKind } from '../semanticKind';
import { SemanticNode } from './semanticNode';

export class ImportSemanticNode extends SemanticNode
{
    public readonly path: string;
    public file: FileSemanticNode;

    constructor (path: string, file: FileSemanticNode)
    {
        super(SemanticKind.File);

        this.path = path;
        this.file = file;
    }
}
