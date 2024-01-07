import * as Diagnostic from '../diagnostic';
import { Connector } from '../connector/connector';
import { FileIntermediate } from '../lowerer/intermediates/fileIntermediate';
import { FileSemanticNode } from '../connector/semanticNodes/fileSemanticNode';
import { FileSyntaxNode } from '../parser/syntaxNodes/fileSyntaxNode';
import FileSystem from 'fs';
import { Importer } from '../importer/importer';
import { IntermediateInterpreter } from '../interpreter/intermediateInterpreter';
import { Lexer } from '../lexer/lexer';
import { LinuxAmd64Backend } from '../backends/linuxAmd64Backend';
import { Lowerer } from '../lowerer/lowerer';
import { ModuleSemanticSymbol } from '../connector/semanticSymbols/moduleSemanticSymbol';
import { Parser } from '../parser/parser';
import Path from 'path';
import { ProcessArguments } from './processArguments';
import { TargetPlatform } from './targetPlatform';
import { TranspilerIntermediate } from '../transpiler/intermediate/transpilerIntermediate';

export class PhosphorCompiler
{
    private diagnostic: Diagnostic.Diagnostic;

    constructor (diagnostic: Diagnostic.Diagnostic)
    {
        this.diagnostic = diagnostic;
    }

    public run (processArguments: ProcessArguments): void
    {
        // TODO: This function should be split into smaller functions.

        const standardLibraryTargetPath = Path.join(processArguments.standardLibraryPath, processArguments.targetPlatform);

        // Create temporary directory for intermediate (IL, ASM, binary etc.) files:
        // TODO: The temporary directory should be formalised or, if possible, completely removed.
        const temporaryDirectoryPath = 'tmp';
        if (!FileSystem.existsSync(temporaryDirectoryPath))
        {
            FileSystem.mkdirSync(temporaryDirectoryPath);
        }

        const lexer = new Lexer(this.diagnostic);
        const parser = new Parser(this.diagnostic);
        const importer = new Importer(this.diagnostic);
        const connector = new Connector(this.diagnostic);
        const lowerer = new Lowerer();

        const searchPaths = [
            Path.dirname(processArguments.filePath),
            standardLibraryTargetPath,
        ];

        const sourceFiles: string[] = [];
        for (const searchPath of searchPaths)
        {
            const sourceFilesInPath = this.getSourceFilesInPathRecursively(searchPath);

            sourceFiles.push(...sourceFilesInPath);
        }

        const syntaxTrees: FileSyntaxNode[] = [];
        let entrySyntaxTree: FileSyntaxNode | null = null;
        for (const sourceFile of sourceFiles)
        {
            /* TODO: We have to parse every file in the search paths. This has drawbacks:
                     - It is slow. Caching could help.
                     - The first error ends the compilation, even if it is an unrelated file. Instead, the compiler should report all
                       errors and continue compiling (as long as possible) with partial information and error propagation. */

            const fileContent = FileSystem.readFileSync(sourceFile, { encoding: 'utf8' });

            const tokens = lexer.run(fileContent, sourceFile);
            const syntaxTree = parser.run(tokens, sourceFile);

            if (sourceFile == processArguments.filePath)
            {
                entrySyntaxTree = syntaxTree;
                entrySyntaxTree.module.isEntryPoint = true;
            }
            else
            {
                syntaxTrees.push(syntaxTree);
            }
        }

        if (entrySyntaxTree == null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `The entry file '${processArguments.filePath}' was not found.`,
                    Diagnostic.Codes.FileNotFoundError
                )
            );
        }

        const importOrderedSyntaxTrees = importer.run(entrySyntaxTree, syntaxTrees);
        const qualifiedNameToFile = new Map<string, FileSemanticNode>();
        const modulesWithInitialisers: Set<ModuleSemanticSymbol> = new Set();

        for (const syntaxTree of importOrderedSyntaxTrees)
        {
            const fileSemanticTree = connector.run(syntaxTree, qualifiedNameToFile);
            // TODO: Check if the qualified name is already in the map.
            qualifiedNameToFile.set(fileSemanticTree.module.qualifiedName, fileSemanticTree);

            if ((fileSemanticTree.variables.length > 0) && !fileSemanticTree.module.isEntryPoint)
            {
                modulesWithInitialisers.add(fileSemanticTree.module);
            }
        }

        let backend: LinuxAmd64Backend;
        switch (processArguments.targetPlatform)
        {
            case TargetPlatform.LinuxAmd64:
                backend = new LinuxAmd64Backend();
                break;
        }

        // TODO: Check if the exit codes of assemblers/linkers/compilers in the backends is non-zero in case of errors.

        if (processArguments.run)
        {
            const intermediateFiles: FileIntermediate[] = [];
            for (const [, fileSemanticTree] of qualifiedNameToFile)
            {
                const intermediateLanguage = lowerer.run(fileSemanticTree, modulesWithInitialisers);
                intermediateFiles.push(intermediateLanguage);
            }

            const intermediateInterpreter = new IntermediateInterpreter();

            intermediateInterpreter.run(intermediateFiles);
        }
        else
        {
            const objectFiles: string[] = [];
            for (const [qualifiedName, fileSemanticTree] of qualifiedNameToFile)
            {
                const intermediateLanguage = lowerer.run(fileSemanticTree, modulesWithInitialisers);

                if (processArguments.intermediate)
                {
                    const intermediateTranspiler = new TranspilerIntermediate();
                    const intermediateCode = intermediateTranspiler.run(intermediateLanguage);

                    FileSystem.writeFileSync(
                        Path.join(temporaryDirectoryPath, qualifiedName + '.phi'),
                        intermediateCode,
                        { encoding: 'utf8' }
                    );
                }

                const objectFilePath = backend.compile(intermediateLanguage, qualifiedName, temporaryDirectoryPath);
                objectFiles.push(objectFilePath);
            }

            const standardLibraryFilePath = Path.join(standardLibraryTargetPath, 'standardLibrary.a');

            backend.link(objectFiles, standardLibraryFilePath, processArguments.outputPath);
        }
    }

    private getSourceFilesInPathRecursively (directoryPath: string): string[]
    {
        const result: string[] = [];

        const filesAndFolders = FileSystem.readdirSync(directoryPath, { withFileTypes: true });

        for (const fileOrFolder of filesAndFolders)
        {
            if (fileOrFolder.isFile())
            {
                if (fileOrFolder.name.endsWith('.ph'))
                {
                    const filePath = Path.join(directoryPath, fileOrFolder.name);

                    result.push(filePath);
                }
            }
            else if (fileOrFolder.isDirectory())
            {
                const subDirectoryPath = Path.join(directoryPath, fileOrFolder.name);

                const subDirectoryFiles = this.getSourceFilesInPathRecursively(subDirectoryPath);

                result.push(...subDirectoryFiles);
            }
        }

        return result;
    }
}
