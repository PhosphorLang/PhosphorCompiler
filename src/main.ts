#!/usr/bin/env node

import * as Diagnostic from './diagnostic';
import * as Intermediates from './lowerer/intermediates';
import * as SemanticNodes from './connector/semanticNodes';
import { ProcessArguments, ProcessArgumentsError } from './processArguments';
import { Connector } from './connector/connector';
import FileSystem from 'fs';
import { Importer } from './importer/importer';
import { Lexer } from './lexer/lexer';
import { LinuxAmd64Backend } from './backends/linuxAmd64Backend';
import { LinuxAmd64LlvmBackend } from './backends/linuxAmd64LlvmBackend';
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
        const standardLibraryTargetPath = this.getStandardLibraryPath();

        const diagnostic = new Diagnostic.Diagnostic();

        const lexer = new Lexer(diagnostic);
        const parser = new Parser(diagnostic);
        const importer = new Importer(diagnostic, lexer, parser, standardLibraryTargetPath);
        const connector = new Connector(diagnostic);
        const lowerer = new Lowerer();

        // Create temporary directory for intermediate (IL, ASM, binary etc.) files:
        // TODO: The temporary directory should be formalised or, if possible, completely removed.
        const temporaryDirectoryPath = 'tmp';
        if (!FileSystem.existsSync(temporaryDirectoryPath))
        {
            FileSystem.mkdirSync(temporaryDirectoryPath);
        }

        const fileContent = FileSystem.readFileSync(this.arguments.filePath, {encoding: 'utf8'});

        let semanticTree: SemanticNodes.File;
        let intermediateLanguage: Intermediates.File;
        try
        {
            const tokens = lexer.run(fileContent, this.arguments.filePath);
            const syntaxTree = parser.run(tokens, this.arguments.filePath);
            const importedSyntaxTrees = importer.run(syntaxTree, this.arguments.filePath);
            semanticTree = connector.run(syntaxTree, importedSyntaxTrees);
            intermediateLanguage = lowerer.run(semanticTree);

            if (this.arguments.intermediate)
            {
                const intermediateTranspiler = new TranspilerIntermediate();
                const intermediateCode = intermediateTranspiler.run(intermediateLanguage);

                FileSystem.writeFileSync(Path.join(temporaryDirectoryPath, 'test.phi'), intermediateCode, {encoding: 'utf8'});
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

        // TODO: Check if the exit codes of assemblers/linkers/compilers in the backends is non-zero in case of errors.

        const standardLibraryFilePath = Path.join(standardLibraryTargetPath, 'standardLibrary.a');

        switch (this.arguments.targetPlatform)
        {
            case TargetPlatform.LinuxAmd64:
            {
                const backend = new LinuxAmd64Backend();
                backend.run(intermediateLanguage, standardLibraryFilePath, temporaryDirectoryPath, this.arguments.outputPath);
                break;
            }
            case TargetPlatform.LinuxAmd64Llvm:
            {
                const backend = new LinuxAmd64LlvmBackend();
                backend.run(intermediateLanguage, standardLibraryFilePath, temporaryDirectoryPath, this.arguments.outputPath);
                break;
            }
        }
    }

    private getStandardLibraryPath (): string
    {
        let platformPath = this.arguments.targetPlatform;

        if (platformPath == TargetPlatform.LinuxAmd64Llvm)
        {
            platformPath = TargetPlatform.LinuxAmd64;
        }

        const standardLibraryTargetPath = Path.join(this.arguments.standardLibraryPath, platformPath);
        return standardLibraryTargetPath;
    }
}

const main = new Main();
main.run();
