import 'mocha';
import { assert } from 'chai';

import ProcessArguments from '../../src/processArguments';

describe('ProcessArguments',
    function ()
    {
        beforeEach(
            function ()
            {
                process.argv = [
                    'main.js',
                ];
            }
        );

        it('recognises short arguments.',
            function ()
            {
                process.argv.push(
                    '-f', 'a',
                    '-o', 'b',
                );

                const processArguments = new ProcessArguments();

                assert.deepStrictEqual(processArguments.filePath, 'a');
                assert.deepStrictEqual(processArguments.outputPath, 'b');
            }
        );

        it('recognises long arguments.',
            function ()
            {
                process.argv.push(
                    '--file', 'a',
                    '--output', 'b',
                );

                const processArguments = new ProcessArguments();

                assert.deepStrictEqual(processArguments.filePath, 'a');
                assert.deepStrictEqual(processArguments.outputPath, 'b');
            }
        );

        it('throws when file argument is missing.',
            function ()
            {
                process.argv.push(
                    '--output', 'b',
                );

                assert.throws(
                    (): void =>
                    {
                        new ProcessArguments();
                    }
                );

            }
        );

        it('throws when output argument is missing.',
            function ()
            {
                process.argv.push(
                    '--file', 'a',
                );

                assert.throws(
                    (): void =>
                    {
                        new ProcessArguments();
                    }
                );

            }
        );
    }
);
