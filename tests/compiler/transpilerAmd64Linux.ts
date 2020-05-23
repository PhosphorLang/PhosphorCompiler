import 'mocha';
import { assert } from 'chai';
import Defaults from '../utility/defaults';
import SemanticCreator from '../utility/semanticCreator';
import TranspilerAmd64Linux from '../../src/transpiler/amd64/linux/transpilerAmd64Linux';

describe('TranspilerAmd64Linux',
    function ()
    {
        it('can transpile an empty file.',
            function ()
            {
                const input = SemanticCreator.newFile();

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    "[extern readLine]\n" +
                    "[extern writeLine]\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can transpile a function declaration.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration()
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    "[extern readLine]\n" +
                    "[extern writeLine]\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );
    }
);
