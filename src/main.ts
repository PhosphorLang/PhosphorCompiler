#!/usr/bin/env node

import Assembler from './assembler/assembler';
import AssemblerLinux64 from './assembler/linux/x86_64/assemblerLinux64';
import Connector from './connector/connector';
import fs from 'fs';
import Lexer from './lexer/lexer';
import Linker from './linker/linker';
import Parser from './parser/parser';
import ProcessArguments from './processArguments';
import Transpiler from './transpiler/transpiler';
import TranspilerLinux64 from './transpiler/linux/x86_64/transpilerLinux64';

class Main
{
    private arguments: ProcessArguments;

    constructor ()
    {
        this.arguments = new ProcessArguments();
    }

    public run (): void
    {
        const lexer = new Lexer();
        const parser = new Parser();
        const connector = new Connector();
        const transpiler: Transpiler = new TranspilerLinux64();
        const assembler: Assembler = new AssemblerLinux64();
        const linker = new Linker();

        const fileContent = fs.readFileSync(this.arguments.filePath, {encoding: 'utf8'});

        let assembly: string;
        try
        {
            const tokens = lexer.run(fileContent, this.arguments.filePath);
            const syntaxTree = parser.run(tokens, this.arguments.filePath);
            const semanticTree = connector.run(syntaxTree);
            assembly = transpiler.run(semanticTree);
        }
        catch (error)
        {
            console.error((error as Error).message);

            return;
        }

        fs.writeFileSync('tmp/test.asm', assembly, {encoding: 'utf8'});

        assembler.run('tmp/test.asm');

        linker.run(this.arguments.outputPath, [this.arguments.standardLibraryPath, 'tmp/test.o']);
    }
}

const main = new Main();
main.run();
