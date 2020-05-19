#!/usr/bin/env node

import ProcessArguments, { ProcessArgumentsError } from './processArguments';
import Assembler from './assembler/assembler';
import AssemblerAmd64Linux from './assembler/amd64/linux/assemblerAmd64Linux';
import Connector from './connector/connector';
import fs from 'fs';
import Lexer from './lexer/lexer';
import Linker from './linker/linker';
import Lowerer from './lowerer/lowerer';
import Parser from './parser/parser';
import Transpiler from './transpiler/transpiler';
import TranspilerAmd64Linux from './transpiler/amd64/linux/transpilerAmd64Linux';

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
        const lexer = new Lexer();
        const parser = new Parser();
        const connector = new Connector();
        const transpiler: Transpiler = new TranspilerAmd64Linux();
        const lowerer = new Lowerer();
        const assembler: Assembler = new AssemblerAmd64Linux();
        const linker = new Linker();

        const fileContent = fs.readFileSync(this.arguments.filePath, {encoding: 'utf8'});

        let assembly: string;
        try
        {
            const tokens = lexer.run(fileContent, this.arguments.filePath);
            const syntaxTree = parser.run(tokens, this.arguments.filePath);
            const semanticTree = connector.run(syntaxTree);
            const loweredSemanticTree = lowerer.run(semanticTree);
            assembly = transpiler.run(loweredSemanticTree);
        }
        catch (error)
        {
            console.error((error as Error).message);

            return;
        }

        fs.writeFileSync('tmp/test.asm', assembly, {encoding: 'utf8'});

        assembler.run('tmp/test.asm');

        linker.run(this.arguments.outputPath, ['tmp/test.o', this.arguments.standardLibraryPath]);
    }
}

const main = new Main();
main.run();
