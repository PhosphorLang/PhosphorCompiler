import * as Diagnostic from '../diagnostic';
import * as SyntaxNodes from '../parser/syntaxNodes';
import { ImportNode } from './importNode';

export class Importer
{
    private readonly diagnostic: Diagnostic.Diagnostic;

    private nameToFileSyntaxNode: Map<string, SyntaxNodes.File>;
    private nameToImportNode: Map<string, ImportNode>;

    constructor (diagnostic: Diagnostic.Diagnostic)
    {
        this.diagnostic = diagnostic;

        this.nameToFileSyntaxNode = new Map();
        this.nameToImportNode = new Map();
    }

    /**
     * The importer sorts the given list of files by their import hierarchy.
     * @param entrySyntaxNode The entry file to start the import.
     * @param syntaxTree A list of all other files to check for imports.
     * @returns A list of all files ordered by their import hierarchy. The first file needs to be compiled first.
     */
    public run (entrySyntaxNode: SyntaxNodes.File, syntaxTree: SyntaxNodes.File[]): SyntaxNodes.File[]
    {
        this.buildSyntaxNodeMap(syntaxTree);

        const importTree = this.importFile(entrySyntaxNode);

        this.nameToFileSyntaxNode.clear();
        this.nameToImportNode.clear();

        const flatTree = this.flattenTree(importTree);

        return flatTree;
    }

    private buildSyntaxNodeMap (syntaxTree: SyntaxNodes.File[]): void
    {
        for (const fileSyntaxNode of syntaxTree)
        {
            const name = fileSyntaxNode.module.namespace.qualifiedName;

            if (this.nameToFileSyntaxNode.has(name))
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Duplicate module name '${name}'`,
                        Diagnostic.Codes.DuplicateModuleNameError,
                        fileSyntaxNode.module.keyword
                    )
                );
            }

            this.nameToFileSyntaxNode.set(name, fileSyntaxNode);
        }
    }

    private importFile (fileSyntaxNode: SyntaxNodes.File): ImportNode
    {
        const children: ImportNode[] = [];

        for (const importSyntaxNode of fileSyntaxNode.imports)
        {
            const name = importSyntaxNode.namespace.qualifiedName;

            if (this.nameToImportNode.has(name))
            {
                const importNode = this.nameToImportNode.get(name)!;
                children.push(importNode);

                continue;
            }

            if (!this.nameToFileSyntaxNode.has(name))
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Module '${name}' not found`,
                        Diagnostic.Codes.ModuleNotFoundError,
                        importSyntaxNode.keyword
                    )
                );
            }

            const importedFileSyntaxNode = this.nameToFileSyntaxNode.get(name)!;

            const importNode = this.importFile(importedFileSyntaxNode);
            children.push(importNode);
        }

        const importNode = new ImportNode(fileSyntaxNode, children);

        this.nameToImportNode.set(importNode.qualifiedName, importNode);

        return importNode;
    }

    private flattenTree (importNode: ImportNode): SyntaxNodes.File[]
    {
        const flatTree: SyntaxNodes.File[] = [];

        importNode.visited = true;

        for (const child of importNode.children)
        {
            if (child.visited)
            {
                continue;
            }

            const childFlatTree = this.flattenTree(child);
            flatTree.push(...childFlatTree);
        }

        flatTree.push(importNode.fileSyntaxNode);

        return flatTree;
    }
}
