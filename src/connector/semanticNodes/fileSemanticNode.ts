import { FunctionDeclarationSemanticNode } from './functionDeclarationSemanticNode';
import { ImportSemanticNode } from './importSemanticNode';
import { SemanticKind } from '../semanticKind';
import { SemanticNode } from './semanticNode';

export class FileSemanticNode extends SemanticNode
{
    public readonly name: string;
    public imports: ImportSemanticNode[];
    public functions: FunctionDeclarationSemanticNode[];

    constructor (name: string, imports: ImportSemanticNode[], functions: FunctionDeclarationSemanticNode[])
    {
        super(SemanticKind.File);

        this.name = name;
        this.imports = imports;
        this.functions = functions;
    }
}
