import { Command, CommanderError, Option } from 'commander';

export type ProcessArgumentsError = CommanderError;

export enum OptimisationLevel
{
    None = 'none',
    Balanced = 'balanced',
    Performance = 'performance',
    Size = 'size',
}

export default class ProcessArguments
{
    public readonly filePath: string;
    public readonly outputPath: string;
    public readonly standardLibraryPath: string;
    public readonly optimisationLevel: OptimisationLevel;

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

        const optimisationOption = new Option('-o, --optimisation <level>', 'Set the optimisation level');
        optimisationOption.choices(Object.values(OptimisationLevel));

        command.addOption(optimisationOption);

        command = command.parse(argv, { from: argv === undefined ? 'node' : 'user' });

        const options = command.opts();

        // If the following were still empty, the command parsing would have thrown an error.
        this.filePath = filePath;
        this.outputPath = outputPath;

        this.standardLibraryPath = options.standardLibrary;
        this.optimisationLevel = options.optimisation;
    }
}
