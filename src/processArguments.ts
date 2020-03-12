import MissingArgumentError from "./errors/missingArgumentError";

export default class ProcessArguments
{
    public readonly filePath: string;
    public readonly outputPath: string;

    constructor ()
    {
        let indexOfFileArgument = process.argv.indexOf('-f');
        if (indexOfFileArgument === -1)
        {
            indexOfFileArgument = process.argv.indexOf('--file');

            if (indexOfFileArgument === -1)
            {
                throw new MissingArgumentError('file path', '"-f <path>" or "--file <path>"');
            }
        }

        let indexOfOutputArgument = process.argv.indexOf('-o');
        if (indexOfOutputArgument === -1)
        {
            indexOfOutputArgument = process.argv.indexOf('--output');

            if (indexOfOutputArgument === -1)
            {
                throw new MissingArgumentError('output file path', '"-o <path>" or "--output <path>"');
            }
        }

        this.filePath = process.argv[indexOfFileArgument + 1];
        this.outputPath = process.argv[indexOfOutputArgument + 1];
    }
}
