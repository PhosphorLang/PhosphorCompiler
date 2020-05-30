import 'mocha';
import { assert } from 'chai';
import BuildInTypes from '../../src/definitions/buildInTypes';
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

        it('can transpile a call statement.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newFunctionCall()
                                ]
                            )
                        )
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
                    "mov rbp, rsp\n" +
                    `call ${Defaults.identifier}\n`;

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can transpile a variable assignment.',
            function ()
            {
                const variable = SemanticCreator.newVariableSymbol();

                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(undefined, variable),
                                    SemanticCreator.newAssignment(
                                        SemanticCreator.newIntegerLiteral(),
                                        variable
                                    )
                                ]
                            )
                        )
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
                    "mov rbp, rsp\n" +
                    `mov r10, ${Defaults.integer}\n`;

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can transpile a variable initialisation.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newIntegerLiteral()
                                    )
                                ]
                            )
                        )
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
                    "mov rbp, rsp\n" +
                    `mov r10, ${Defaults.integer}\n`;

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can transpile an integer addition.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newIntegerAddition()
                                    )
                                ]
                            )
                        )
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
                    "mov rbp, rsp\n" +
                    `mov r10, ${Defaults.integer}\n` +
                    `mov r11, ${Defaults.integer}\n` +
                    "add r10, r11\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can transpile an empty return statement.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newReturn()
                                ]
                            )
                        )
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
                    "mov rbp, rsp\n" +
                    "leave\n" +
                    "ret\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can transpile a function returning a value.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newReturn(
                                        SemanticCreator.newIntegerLiteral()
                                    )
                                ]
                            ),
                            SemanticCreator.newFunctionSymbol(
                                undefined,
                                BuildInTypes.int
                            )
                        )
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
                    "mov rbp, rsp\n" +
                    `mov rax, ${Defaults.integer}\n` +
                    "leave\n" +
                    "ret\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );
    }
);
