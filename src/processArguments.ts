import { Command, CommanderError, Option } from 'commander';
import OptimisationLevel from './options/optimisationLevel';
import TargetPlatform from './options/targetPlatform';

export type ProcessArgumentsError = CommanderError;

/** This is the typing for the result of command.opts. It allows typesafe handling of the options. */
interface OptionValues
{
    standardLibrary: string;
    optimisation?: OptimisationLevel;
    target?: TargetPlatform;
}

export default class ProcessArguments
{
    public readonly filePath: string;
    public readonly outputPath: string;
    public readonly standardLibraryPath: string;
    public readonly optimisationLevel: OptimisationLevel;
    public readonly targetPlatform: TargetPlatform;

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

        const targetOption = new Option('-t, --target <platform>', 'Set the compilation target platform');
        targetOption.choices(Object.values(TargetPlatform));

        command.addOption(targetOption);

        command = command.parse(argv, { from: 'user' });

        const options = command.opts() as OptionValues;

        // If the following were still empty, the command parsing would have thrown an error.
        this.filePath = filePath;
        this.outputPath = outputPath;
        this.standardLibraryPath = options.standardLibrary;

        this.optimisationLevel = options.optimisation ?? OptimisationLevel.None;
        this.targetPlatform = options.target ?? TargetPlatform.LinuxAmd64; // TODO: Use the platform the compiler runs on as default.
    }
}
