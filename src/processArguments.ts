import { Command, CommanderError } from 'commander';

export type ProcessArgumentsError = CommanderError;

export default class ProcessArguments
{
    public readonly filePath: string;
    public readonly outputPath: string;
    public readonly standardLibraryPath: string;

    constructor (argv?: string[])
    {
        let filePath = '';
        let outputPath = '';

        let command = new Command();

        command.exitOverride(
            (error): void =>
            {
                // We do not want that command calls process.exit() directly. Instead, the error shall be thrown so that we can handle
                // it later, either in the programme itself (and do not much with it) or, more importantly, in the unit tests to test
                // whether there really has been an error.
                throw error;
            }
        );

        command.name('phosphor');

        command
            .arguments('<inputFile> <outputFile>')
            .action(
                (inputFile: string, outputFile: string) =>
                {
                    filePath = inputFile;
                    outputPath = outputFile;
                }
            );

        command
            .option(
                '-s, --standardLibrary <file>',
                'File path to the compiled standard library',
                'standardLibrary.a',
            );

        command = command.parse(argv, { from: argv === undefined ? 'node' : 'user' });

        // If the following would still be empty, the command parsing would have been thrown an error.
        this.filePath = filePath;
        this.outputPath = outputPath;

        this.standardLibraryPath = command.standardLibrary as string;
    }
}
