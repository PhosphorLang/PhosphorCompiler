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

                const expectedResult =
                    "[section .rodata]\n" +
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

        it('can transpile an integer parameter.',
            function ()
            {
                const input = new ActionTreeNode(null, new ActionToken(SemanticalType.File, fileName));
                new ActionTreeNode(input, new ActionToken(SemanticalType.Function, 'print'));
                new ActionTreeNode(input.children[0], new ActionToken(SemanticalType.IntegerLiteral, 'c_0', '24'));
                new ActionTreeNode(input, new ActionToken(SemanticalType.IntegerDefinition, 'c_0', '24'));

                const expectedResult =
                    "[section .rodata]\n" +
                    "c_0: db 24\n" +
                    "[section .text]\n" +
                    "[global _start]\n" +
                    "[extern print]\n" +
                    "_start:\n" +
                    "mov rdi, c_0\n" +
                    "mov rsi, 1\n" +
                    "call print\n" +
                    "mov rdi, 0\n" +
                    "mov rax, 60\n" +
                    "syscall\n";

                const transpiler = new TranspilerLinux64();

                const result = transpiler.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can transpile a string parameter.',
            function ()
            {
                const input = new ActionTreeNode(null, new ActionToken(SemanticalType.File, fileName));
                new ActionTreeNode(input, new ActionToken(SemanticalType.Function, 'print'));
                new ActionTreeNode(input.children[0], new ActionToken(SemanticalType.StringLiteral, 'c_0', 'Test string'));
                new ActionTreeNode(input, new ActionToken(SemanticalType.StringDefinition, 'c_0', 'Test string'));

                const expectedResult =
                    "[section .rodata]\n" +
                    "c_0: db 'Test string'\n" +
                    "[section .text]\n" +
                    "[global _start]\n" +
                    "[extern print]\n" +
                    "_start:\n" +
                    "mov rdi, c_0\n" +
                    "mov rsi, 11\n" +
                    "call print\n" +
                    "mov rdi, 0\n" +
                    "mov rax, 60\n" +
                    "syscall\n";

                const transpiler = new TranspilerLinux64();

                const result = transpiler.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        // TODO: Test UTF-8 strings in every stage.
    }
);
