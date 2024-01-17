import { Command, CommanderError, Option } from 'commander';
import { OptimisationLevel } from './optimisationLevel';
import { TargetPlatform } from './targetPlatform';

export type ProcessArgumentsError = CommanderError;

/** This is the typing for the result of command.opts. It allows typesafe handling of the options. */
interface OptionValues
{
    standardLibrary?: string;
    noStandardLibrary?: boolean;
    temporaryPath?: string;
    optimisation?: OptimisationLevel;
    target?: TargetPlatform;
    intermediate?: boolean;
}

export class ProcessArguments
{
    public readonly filePath: string;
    public readonly outputPath: string;
    public readonly standardLibraryPath: string;
    public readonly includeStandardLibrary: boolean;
    public readonly temporaryPath: string;
    public readonly optimisationLevel: OptimisationLevel;
    public readonly targetPlatform: TargetPlatform;
    public readonly intermediate: boolean;

    constructor (argv?: string[])
    {
        let filePath = '';
        let outputPath = '';

        let command = new Command();

        const version = process.env['npm_package_version'];
        if (version !== undefined)
        {
            command.version(version, '-v, --version');
        }

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

        const standardLibraryOption = new Option(
            '-s, --standardLibrary <file>',
            'File path to the compiled standard library'
        );
        standardLibraryOption.conflicts('noStandardLibrary');
        command.addOption(standardLibraryOption);

        const noStandardLibraryOption = new Option(
            '--noStandardLibrary',
            'Do not link with the standard library'
        );
        noStandardLibraryOption.conflicts('standardLibrary');
        command.addOption(noStandardLibraryOption);

        // TODO: The "set" part in the descriptions is unnecessary and should be removed.
        const temporaryPathOption = new Option('-p, --temporaryPath <path>', 'Set the path where temporary files are stored');
        // TODO: Should we add the default option here? Should we do that for all optional options?
        command.addOption(temporaryPathOption);

        const optimisationOption = new Option('-o, --optimisation <level>', 'Set the optimisation level');
        optimisationOption.choices(Object.values(OptimisationLevel));
        command.addOption(optimisationOption);

        const targetOption = new Option('-t, --target <platform>', 'Set the compilation target platform');
        targetOption.choices(Object.values(TargetPlatform));
        command.addOption(targetOption);

        const intermediateOption = new Option('-i, --intermediate', 'Generate intermediate code');
        command.addOption(intermediateOption);

        command = command.parse(argv, { from: argv === undefined ? 'node' : 'user' });

        // TODO: Check how the typing changed here (in the whole commander library):
        const options = command.opts<OptionValues>();

        // If the following were still empty, the command parsing would have thrown an error.
        this.filePath = filePath;
        this.outputPath = outputPath;

        this.standardLibraryPath = options.standardLibrary ?? 'standardLibrary.a';
        this.includeStandardLibrary = options.noStandardLibrary ?? true;

        this.temporaryPath = options.temporaryPath ?? 'tmp';
        this.optimisationLevel = options.optimisation ?? OptimisationLevel.None;
        this.targetPlatform = options.target ?? TargetPlatform.LinuxAmd64; // TODO: Use the platform the compiler runs on as default.
        this.intermediate = options.intermediate ?? false;
    }
}
