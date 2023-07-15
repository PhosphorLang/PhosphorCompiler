import { FileSyntaxNode } from '../parser/syntaxNodes/fileSyntaxNode';

export class ImportNode
{
    public readonly fileSyntaxNode: FileSyntaxNode;
    public readonly children: ImportNode[];

    public visited: boolean;

    public get qualifiedName (): string
    {
        return this.fileSyntaxNode.module.namespace.qualifiedName;
    }

    constructor (fileSyntaxNode: FileSyntaxNode, children: ImportNode[]|null = null)
    {
        this.fileSyntaxNode = fileSyntaxNode;
        this.children = children ?? [];

        this.visited = false;
    }
}
