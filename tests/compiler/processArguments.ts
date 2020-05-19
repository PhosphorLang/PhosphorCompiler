import 'mocha';
import { assert } from 'chai';
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

                assert.deepStrictEqual(processArguments.filePath, 'inFile');
                assert.deepStrictEqual(processArguments.outputPath, 'outFile');
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

                assert.deepStrictEqual(processArguments.standardLibraryPath, 'standardLibrary');
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
    }
);
