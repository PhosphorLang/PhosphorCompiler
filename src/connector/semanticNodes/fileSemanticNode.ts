import { FunctionDeclarationSemanticNode } from './functionDeclarationSemanticNode';
import { ModuleSemanticSymbol } from '../semanticSymbols/moduleSemanticSymbol';
import { SemanticKind } from '../semanticKind';
import { SemanticNode } from './semanticNode';

export class FileSemanticNode extends SemanticNode
{
    public readonly name: string;
    public readonly module: ModuleSemanticSymbol;
    public readonly imports: ModuleSemanticSymbol[];
    public readonly functions: FunctionDeclarationSemanticNode[];

    constructor (name: string, module: ModuleSemanticSymbol, imports: ModuleSemanticSymbol[], functions: FunctionDeclarationSemanticNode[])
    {
        super(SemanticKind.File);

        this.name = name;
        this.module = module;
        this.imports = imports;
        this.functions = functions;
    }
}
