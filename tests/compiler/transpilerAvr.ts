import 'mocha';
import { assert } from 'chai';
import SemanticCreator from '../utility/semanticCreator';
import TranspilerAvr from '../../src/transpiler/avr/transpilerAvr';

describe('TranspilerAvr',
    function ()
    {
        it('can transpile an empty file.',
            function ()
            {
                const input = SemanticCreator.newFile();

                const expectedResult =
                    ".global _start\n" +
                    "_start:\n" +
                    "rcall main\n" +
                    "rcall exit\n";

                const transpiler = new TranspilerAvr();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );
    }
);
