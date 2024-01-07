import 'mocha';
import { assert } from 'chai';
import { OptimisationLevel } from '../../src/compilerInterface/optimisationLevel';
import { ProcessArguments } from '../../src/compilerInterface/processArguments';
import { TargetPlatform } from '../../src/compilerInterface/targetPlatform';

describe('ProcessArguments',
    function ()
    {
        it('recognises in and out file.',
            function ()
            {
                const argv: string[] = [
                    'inFile',
                    'outFile',
                ];

                const processArguments = new ProcessArguments(argv);

                assert.strictEqual(processArguments.filePath, 'inFile');
                assert.strictEqual(processArguments.outputPath, 'outFile');
            }
        );

        it('recognises standard library.',
            function ()
            {
                const argv: string[] = [
                    '--standardLibrary', 'standardLibrary',
                    'inFile',
                    'outFile',
                ];

                const processArguments = new ProcessArguments(argv);

                assert.strictEqual(processArguments.standardLibraryPath, 'standardLibrary');
            }
        );

        it('recognises optimisation.',
            function ()
            {
                const argv: string[] = [
                    '--optimisation', OptimisationLevel.Balanced,
                    'inFile',
                    'outFile',
                ];

                const processArguments = new ProcessArguments(argv);

                assert.equal(processArguments.optimisationLevel, OptimisationLevel.Balanced);
            }
        );

        it('recognises target.',
            function ()
            {
                const argv: string[] = [
                    '--target', TargetPlatform.LinuxAmd64,
                    'inFile',
                    'outFile',
                ];

                const processArguments = new ProcessArguments(argv);

                assert.equal(processArguments.targetPlatform, TargetPlatform.LinuxAmd64);
            }
        );

        it('throws when file argument is missing.',
            function ()
            {
                const argv: string[] = [];

                assert.throws(
                    (): void =>
                    {
                        new ProcessArguments(argv);
                    },
                    "error: missing required argument 'inputFile'"
                );
            }
        );

        it('throws when output argument is missing.',
            function ()
            {
                const argv: string[] = [
                    'inFile',
                ];

                assert.throws(
                    (): void =>
                    {
                        new ProcessArguments(argv);
                    },
                    "error: missing required argument 'outputFile'"
                );
            }
        );

        it('throws when optimisation option is set to an unknown value.',
            function ()
            {
                const argv: string[] = [
                    '--standardLibrary', 'standardLibrary',
                    '--optimisation', 'invalidValue',
                    'inFile',
                    'outFile',
                ];

                assert.throws(
                    (): void =>
                    {
                        new ProcessArguments(argv);
                    },
                    /error.+-o, --optimisation.+'invalidValue' is invalid.*/i
                );
            }
        );

        it('throws when target option is set to an unknown value.',
            function ()
            {
                const argv: string[] = [
                    '--standardLibrary', 'standardLibrary',
                    '--target', 'invalidValue',
                    'inFile',
                    'outFile',
                ];

                assert.throws(
                    (): void =>
                    {
                        new ProcessArguments(argv);
                    },
                    /error.+-t, --target.+'invalidValue' is invalid.*/i
                );
            }
        );
    }
);
