#!/usr/bin/env node

import Lexer from './lexer/lexer';

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
        console.log('run: ' + this.filePath + ' - ' + this.outputPath);

        const lexer = new Lexer();

        const tokens = lexer.run(this.filePath);

        console.log(tokens);
    }
}

const main = new Main();
main.run();
