import 'mocha';
import { assert } from 'chai';
import OptimisationLevel from '../../src/options/optimisationLevel';
import ProcessArguments from '../../src/processArguments';

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

        it('throws when file argument is missing.',
            function ()
            {
                const argv: string[] = [];

                assert.throws(
                    (): void =>
                    {
                        new ProcessArguments(argv);
                    }
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
                    }
                );
            }
        );

        it('throws when standardLibrary option is set without any value.',
            function ()
            {
                const argv: string[] = [
                    '--standardLibrary',
                    'inFile',
                    'outFile',
                ];

                assert.throws(
                    (): void =>
                    {
                        new ProcessArguments(argv);
                    }
                );
            }
        );

        it('throws when optimisation option is set to an unknown value.',
            function ()
            {
                const argv: string[] = [
                    '--optimisation invalidValue',
                    'inFile',
                    'outFile',
                ];

                assert.throws(
                    (): void =>
                    {
                        new ProcessArguments(argv);
                    }
                );
            }
        );
    }
);
