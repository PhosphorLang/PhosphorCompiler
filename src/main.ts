#!/usr/bin/env node

import * as Diagnostic from './diagnostic';
import { ProcessArguments,ProcessArgumentsError } from './processArguments';
import { Assembler } from './assembler/assembler';
import { AssemblerAmd64Linux } from './assembler/amd64/linux/assemblerAmd64Linux';
import { AssemblerAvr } from './assembler/avr/assemblerAvr';
import { Connector } from './connector/connector';
import FileSystem from 'fs';
import { Importer } from './importer/importer';
import { Lexer } from './lexer/lexer';
import { Linker } from './linker/linker';
import { LinkerAmd64Linux } from './linker/amd64/linux/linkerAmd64Linux';
import { LinkerAvr } from './linker/avr/linkerAvr';
import { Lowerer } from './lowerer/lowerer';
import os from 'os';
import { Parser } from './parser/parser';
import Path from 'path';
import { SemanticTreeTranspiler } from './transpiler/semanticTreeTranspiler';
import { TargetPlatform } from './options/targetPlatform';
import { Transpiler } from './transpiler/transpiler';
import { TranspilerAmd64Linux } from './transpiler/amd64/linux/transpilerAmd64Linux';
import { TranspilerAvr } from './transpiler/avr/transpilerAvr';
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
        const standardLibraryTargetPath = Path.join(this.arguments.standardLibraryPath, this.arguments.targetPlatform);

        const diagnostic = new Diagnostic.Diagnostic();

        const lexer = new Lexer(diagnostic);
        const parser = new Parser(diagnostic);
        const importer = new Importer(diagnostic, lexer, parser, standardLibraryTargetPath);
        const connector = new Connector(diagnostic);
        const lowerer = new Lowerer();
        let transpiler: Transpiler|SemanticTreeTranspiler;
        let assembler: Assembler;
        let linker: Linker;

        switch (this.arguments.targetPlatform)
        {
            case TargetPlatform.LinuxAmd64:
                transpiler = new TranspilerAmd64Linux();
                assembler = new AssemblerAmd64Linux();
                linker = new LinkerAmd64Linux();
                break;
            case TargetPlatform.Avr:
                transpiler = new TranspilerAvr();
                assembler = new AssemblerAvr();
                linker = new LinkerAvr();
                break;
        }

        const fileContent = FileSystem.readFileSync(this.arguments.filePath, {encoding: 'utf8'});

        let assembly: string;
        try
        {
            const tokens = lexer.run(fileContent, this.arguments.filePath);
            const syntaxTree = parser.run(tokens, this.arguments.filePath);
            const importedSyntaxTrees = importer.run(syntaxTree, this.arguments.filePath);
            const semanticTree = connector.run(syntaxTree, importedSyntaxTrees);
            const intermediateLanguage = lowerer.run(semanticTree);

            if (this.arguments.intermediate)
            {
                const intermediateTranspiler = new TranspilerIntermediate();
                const intermediateCode = intermediateTranspiler.run(intermediateLanguage);

                FileSystem.writeFileSync('tmp/test.phi', intermediateCode, {encoding: 'utf8'});
            }

            assembly = transpiler.run(semanticTree);

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

        FileSystem.writeFileSync('tmp/test.asm', assembly, {encoding: 'utf8'});

        assembler.run('tmp/test.asm', 'tmp/test.o');

        const standardLibraryFilePath = Path.join(standardLibraryTargetPath, 'standardLibrary.a');

        const linkerFiles = ['tmp/test.o'];
        const libraryFiles = [standardLibraryFilePath];

        linker.run(this.arguments.outputPath, linkerFiles, libraryFiles);
    }
}

const main = new Main();
main.run();
