#!/usr/bin/env node

import * as Diagnostic from './diagnostic';
import { ProcessArguments, ProcessArgumentsError } from './processArguments';
import { Connector } from './connector/connector';
import { FileIntermediate } from './lowerer/intermediates/fileIntermediate';
import { FileSemanticNode } from './connector/semanticNodes/fileSemanticNode';
import { FileSyntaxNode } from './parser/syntaxNodes/fileSyntaxNode';
import FileSystem from 'fs';
import { Importer } from './importer/importer';
import { IntermediateInterpreter } from './interpreter/intermediateInterpreter';
import { Lexer } from './lexer/lexer';
import { LinuxAmd64Backend } from './backends/linuxAmd64Backend';
import { Lowerer } from './lowerer/lowerer';
import os from 'os';
import { Parser } from './parser/parser';
import Path from 'path';
import { TargetPlatform } from './options/targetPlatform';
import { TranspilerIntermediate } from './transpiler/intermediate/transpilerIntermediate';

class Main
{
    private arguments: ProcessArguments;

    constructor ()
    {
        try
        {
            this.arguments = new ProcessArguments();
        }
        catch (error)
        {
            const processArgumentsError = error as ProcessArgumentsError;

            process.exit(processArgumentsError.exitCode);
        }
    }

    public run (): void
    {
        // TODO: This function should be split into smaller functions.

        const standardLibraryTargetPath = Path.join(this.arguments.standardLibraryPath, this.arguments.targetPlatform);

        // Create temporary directory for intermediate (IL, ASM, binary etc.) files:
        // TODO: The temporary directory should be formalised or, if possible, completely removed.
        const temporaryDirectoryPath = 'tmp';
        if (!FileSystem.existsSync(temporaryDirectoryPath))
        {
            FileSystem.mkdirSync(temporaryDirectoryPath);
        }

        const diagnostic = new Diagnostic.Diagnostic();

        const lexer = new Lexer(diagnostic);
        const parser = new Parser(diagnostic);
        const importer = new Importer(diagnostic);
        const connector = new Connector(diagnostic);
        const lowerer = new Lowerer();

        const searchPaths = [
            Path.dirname(this.arguments.filePath),
            standardLibraryTargetPath,
        ];

        const sourceFiles: string[] = [];
        for (const searchPath of searchPaths)
        {
            const sourceFilesInPath = this.getSourceFilesInPathRecursively(searchPath);

            sourceFiles.push(...sourceFilesInPath);
        }

        try
        {
            const syntaxTrees: FileSyntaxNode[] = [];
            let entrySyntaxTree: FileSyntaxNode|null = null;
            for (const sourceFile of sourceFiles)
            {
                /* TODO: We have to parse every file in the search paths. This has drawbacks:
                         - It is slow. Caching could help.
                         - The first error ends the compilation, even if it is an unrelated file. Instead, the compiler should report all
                           errors and continue compiling (as long as possible) with partial information and error propagation. */

                const fileContent = FileSystem.readFileSync(sourceFile, {encoding: 'utf8'});

                const tokens = lexer.run(fileContent, sourceFile);
                const syntaxTree = parser.run(tokens, sourceFile);

                if (sourceFile == this.arguments.filePath)
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
                diagnostic.throw(
                    new Diagnostic.Error(
                        `The entry file '${this.arguments.filePath}' was not found.`,
                        Diagnostic.Codes.FileNotFoundError
                    )
                );

                entrySyntaxTree = entrySyntaxTree!; // HACK: This is a workaround for the type checker.
            }

            const importOrderedSyntaxTrees = importer.run(entrySyntaxTree, syntaxTrees);
            const qualifiedNameToFile = new Map<string, FileSemanticNode>();

            for (const syntaxTree of importOrderedSyntaxTrees)
            {
                const fileSemanticTree = connector.run(syntaxTree, qualifiedNameToFile);
                qualifiedNameToFile.set(fileSemanticTree.module.qualifiedName, fileSemanticTree);
            }

            let backend: LinuxAmd64Backend;
            switch (this.arguments.targetPlatform)
            {
                case TargetPlatform.LinuxAmd64:
                    backend = new LinuxAmd64Backend();
                    break;
            }

            // TODO: Check if the exit codes of assemblers/linkers/compilers in the backends is non-zero in case of errors.

            if (this.arguments.run)
            {
                const intermediateFiles: FileIntermediate[] = [];
                for (const [, fileSemanticTree] of qualifiedNameToFile)
                {
                    const intermediateLanguage = lowerer.run(fileSemanticTree);
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
                    const intermediateLanguage = lowerer.run(fileSemanticTree);

                    if (this.arguments.intermediate)
                    {
                        const intermediateTranspiler = new TranspilerIntermediate();
                        const intermediateCode = intermediateTranspiler.run(intermediateLanguage);

                        FileSystem.writeFileSync(
                            Path.join(temporaryDirectoryPath, qualifiedName + '.phi'),
                            intermediateCode,
                            {encoding: 'utf8'}
                        );
                    }

                    const objectFilePath = backend.compile(intermediateLanguage, qualifiedName, temporaryDirectoryPath);
                    objectFiles.push(objectFilePath);
                }

                const standardLibraryFilePath = Path.join(standardLibraryTargetPath, 'standardLibrary.a');

                backend.link(objectFiles, standardLibraryFilePath, this.arguments.outputPath);
            }

            diagnostic.end();
        }
        catch (error)
        {
            if (error instanceof Diagnostic.Exception)
            {
                return;
            }
            else
            {
                throw error;
            }
        }
        finally
        {
            if (diagnostic.errors.length != 0)
            {
                const errorString = diagnostic.errors.join(os.EOL);

                console.error(errorString);
            }

            if (diagnostic.warnings.length != 0)
            {
                const warningString = diagnostic.warnings.join(os.EOL);

                console.error(warningString);
            }

            if (diagnostic.info.length != 0)
            {
                const infoString = diagnostic.info.join(os.EOL);

                console.error(infoString);
            }
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

const main = new Main();
main.run();
