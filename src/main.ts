#!/usr/bin/env node

import Assembler from './assembler/assembler';
import AssemblerLinux64 from './assembler/linux/x86_64/assemblerLinux64';
import Constructor from './constructor_/constructor';
import fs from 'fs';
import Lexer from './lexer/lexer';
import Linker from './linker/linker';
import Parser from './parser/parser';
import Transpiler from './transpiler/transpiler';
import TranspilerLinux64 from './transpiler/linux/x86_64/transpilerLinux64';

class Main
{
    private filePath: string;
    private outputPath: string;

    constructor ()
    {
        // TODO: Own class for command line parameters.

        let indexOfFileArgument = process.argv.indexOf('-f');
        if (indexOfFileArgument === -1)
        {
            indexOfFileArgument = process.argv.indexOf('--file');

            if (indexOfFileArgument === -1)
            {
                throw new Error('No file given.');
            }
        }

        let indexOfOutputArgument = process.argv.indexOf('-o');
        if (indexOfOutputArgument === -1)
        {
            indexOfOutputArgument = process.argv.indexOf('--output');

            if (indexOfOutputArgument === -1)
            {
                throw new Error('No output file path given.');
            }
        }

        this.filePath = process.argv[indexOfFileArgument + 1];
        this.outputPath = process.argv[indexOfOutputArgument + 1];
    }

    public run (): void
    {
        const lexer = new Lexer();
        const parser = new Parser();
        const constructor = new Constructor();
        const transpiler: Transpiler = new TranspilerLinux64();
        const assembler: Assembler = new AssemblerLinux64();
        const linker = new Linker();

        const fileContent = fs.readFileSync(this.filePath, {encoding: 'utf8'});

        const tokens = lexer.run(fileContent);
        const syntaxTree = parser.run(tokens, this.filePath);
        const actionTree = constructor.run(syntaxTree);
        const assembly = transpiler.run(actionTree);

        fs.writeFileSync('tmp/test.asm', assembly, {encoding: 'utf8'});

        assembler.run('tmp/test.asm');

        linker.run(this.outputPath, ['tmp/test.o', 'tmp/standard.o']);
    }
}

const main = new Main();
main.run();
