#!/usr/bin/env node

import ProcessArguments, { ProcessArgumentsError } from './processArguments';
import Assembler from './assembler/assembler';
import AssemblerAmd64Linux from './assembler/amd64/linux/assemblerAmd64Linux';
import AssemblerAvr from './assembler/avr/assemblerAvr';
import Connector from './connector/connector';
import Diagnostic from './diagnostic/diagnostic';
import DiagnosticException from './diagnostic/diagnosticException';
import FileSystem from 'fs';
import Importer from './importer/importer';
import Lexer from './lexer/lexer';
import Linker from './linker/linker';
import LinkerAmd64Linux from './linker/amd64/linux/linkerAmd64Linux';
import LinkerAvr from './linker/avr/linkerAvr';
import Lowerer from './lowerer/lowerer';
import os from 'os';
import Parser from './parser/parser';
import Path from "path";
import TargetPlatform from './options/targetPlatform';
import Transpiler from './transpiler/transpiler';
import TranspilerAmd64Linux from './transpiler/amd64/linux/transpilerAmd64Linux';
import TranspilerAvr from './transpiler/avr/transpilerAvr';

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

        const diagnostic = new Diagnostic();

        const lexer = new Lexer(diagnostic);
        const parser = new Parser(diagnostic);
        const importer = new Importer(diagnostic, lexer, parser, standardLibraryTargetPath);
        const connector = new Connector(diagnostic);
        const lowerer = new Lowerer();
        let transpiler: Transpiler;
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
            const loweredSemanticTree = lowerer.run(semanticTree);
            assembly = transpiler.run(loweredSemanticTree);

            diagnostic.end();
        }
        catch (error)
        {
            if (error instanceof DiagnosticException)
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
            else
            {
                throw error;
            }

            return;
        }

        FileSystem.writeFileSync('tmp/test.asm', assembly, {encoding: 'utf8'});

        assembler.run('tmp/test.asm', 'tmp/test.o');

        const standardLibraryFilePath = Path.join(standardLibraryTargetPath, 'standardLibrary.a');

        const linkerFiles = ['tmp/test.o', standardLibraryFilePath];

        linker.run(this.arguments.outputPath, linkerFiles);
    }
}

const main = new Main();
main.run();
