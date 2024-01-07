#!/usr/bin/env node

import * as Diagnostic from './diagnostic';
import { ProcessArguments, ProcessArgumentsError } from './compilerInterface/processArguments';
import Os from 'os';
import { PhosphorCompiler } from './compilerInterface/phoshorCompiler';

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
        const diagnostic = new Diagnostic.Diagnostic();

        try
        {
            const phosphorCompiler = new PhosphorCompiler(diagnostic);

            phosphorCompiler.run(this.arguments);

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
                const errorString = diagnostic.errors.join(Os.EOL);

                console.error(errorString);
            }

            if (diagnostic.warnings.length != 0)
            {
                const warningString = diagnostic.warnings.join(Os.EOL);

                console.error(warningString);
            }

            if (diagnostic.info.length != 0)
            {
                const infoString = diagnostic.info.join(Os.EOL);

                console.error(infoString);
            }
        }
    }
}

const main = new Main();
main.run();
