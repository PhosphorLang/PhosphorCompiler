import 'mocha';
import { assert } from 'chai';
import { Defaults } from '../utility/defaults';
import { IntermediateCreator } from '../utility/intermediateCreator';
import { IntermediateSize } from '../../src/lowerer/intermediateSize';
import { TranspilerAmd64Linux } from '../../src/transpiler/amd64/linux/transpilerAmd64Linux';

describe('TranspilerAmd64Linux',
    function ()
    {
        it('can transpile an empty file.',
            function ()
            {
                const input = IntermediateCreator.newFile();

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a function declaration.',
            function ()
            {
                const input = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(),
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n" +
                    "leave\n" +
                    "ret\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a function declaration with parameters.',
            function ()
            {
                const input = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(
                            [
                                IntermediateCreator.newReturn(),
                            ],
                            IntermediateCreator.newFunctionSymbol(
                                [
                                    IntermediateSize.Native,
                                ]
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n" +
                    "leave\n" +
                    "ret\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a call statement.',
            function ()
            {
                const input = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(
                            [
                                IntermediateCreator.newCall(),
                                IntermediateCreator.newReturn(),
                            ]
                        ),
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n" +
                    `call ${Defaults.identifier}\n` +
                    "leave\n" +
                    "ret\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a call statement with a parameter.',
            function ()
            {
                const variableSymbol = IntermediateCreator.newVariableSymbol();

                const input = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(
                            [
                                IntermediateCreator.newIntroduce(variableSymbol),
                                IntermediateCreator.newMove(
                                    variableSymbol,
                                    IntermediateCreator.newLiteralSymbol()
                                ),
                                IntermediateCreator.newGive(
                                    IntermediateCreator.newParameterSymbol(),
                                    variableSymbol
                                ),
                                IntermediateCreator.newDismiss(variableSymbol),
                                IntermediateCreator.newCall(),
                                IntermediateCreator.newReturn(),
                            ]
                        ),
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n" +
                    "sub rsp, 8\n" +
                    "mov rbx, [rbp-0]\n" +
                    `mov rbx, ${Defaults.integer}\n` +
                    "mov [rbp-0], rbx\n" +
                    "mov rdi, [rbp-0]\n" +
                    `call ${Defaults.identifier}\n` +
                    "leave\n" +
                    "ret\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a constant.',
            function ()
            {
                // TODO: Implement.
            }
        );

        it('can transpile an external function.',
            function ()
            {
                // TODO: Implement.
            }
        );

        it('can transpile a move.',
            function ()
            {
                // TODO: Implement.
            }
        );

        it('can transpile an addition.',
            function ()
            {
                // TODO: Implement.
            }
        );

        it('can transpile a subtraction.',
            function ()
            {
                // TODO: Implement.
            }
        );

        it('can transpile a negation.',
            function ()
            {
                // TODO: Implement.
            }
        );

        it('can transpile a .',
            function ()
            {
                // TODO: Implement.
            }
        );

        it('can transpile a goto statement.',
            function ()
            {
                // TODO: Implement.
            }
        );

        it('can transpile a jump if equal.',
            function ()
            {
                // TODO: Implement.
            }
        );

        it('can transpile a jump if greater.',
            function ()
            {
                // TODO: Implement.
            }
        );

        it('can transpile a jump if less.',
            function ()
            {
                // TODO: Implement.
            }
        );

        it('can transpile a value return.',
            function ()
            {
                // TODO: Implement.
            }
        );
    }
);
