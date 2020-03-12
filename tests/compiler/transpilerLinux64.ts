import 'mocha';
import ActionToken from '../../src/constructor_/actionToken';
import ActionTreeNode from '../../src/constructor_/actionTreeNode';
import { assert } from 'chai';
import SemanticalType from '../../src/constructor_/semanticalType';
import TranspilerLinux64 from '../../src/transpiler/linux/x86_64/transpilerLinux64';

describe('TranspilerLinux64',
    function ()
    {
        const fileName = 'testFile';

        it('can transpile a function call.',
            function ()
            {
                const input = new ActionTreeNode(null, new ActionToken(SemanticalType.File, fileName));
                new ActionTreeNode(input, new ActionToken(SemanticalType.Function, 'print'));

                const expectedResult = "[section .rodata]\n" +
                    "[section .text]\n" +
                    "[global _start]\n" +
                    "[extern print]\n" +
                    "_start:\n" +
                    "call print\n" +
                    "mov rdi, 0\n" +
                    "mov rax, 60\n" +
                    "syscall\n";

                const transpiler = new TranspilerLinux64();

                const result = transpiler.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );
    }
);
