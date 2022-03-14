import 'mocha';
import { assert } from 'chai';
import { BuildInOperators } from '../../src/definitions/buildInOperators';
import { BuildInTypes } from '../../src/definitions/buildInTypes';
import { Defaults } from '../utility/defaults';
import { SemanticCreator } from '../utility/semanticCreator';
import { TranspilerAmd64Linux } from '../../src/transpiler/amd64/linux/transpilerAmd64Linux';

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
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration()
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
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

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a function declaration with parameters.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            undefined,
                            SemanticCreator.newFunctionSymbol(
                                [
                                    SemanticCreator.newFunctionParameter()
                                ],
                                BuildInTypes.int
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
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

                assert.strictEqual(result, expectedResult);
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

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a call statement with a parameter.',
            function ()
            {
                const functionSymbol = SemanticCreator.newFunctionSymbol(
                    [
                        SemanticCreator.newFunctionParameter(BuildInTypes.int)
                    ]
                );

                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newFunctionCall(
                                        [SemanticCreator.newIntegerLiteral()],
                                        functionSymbol
                                    )
                                ]
                            ),
                            functionSymbol
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n" +
                    `mov rdi, ${Defaults.integer}\n` +
                    `call ${Defaults.identifier}\n`;

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
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

                assert.strictEqual(result, expectedResult);
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

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a variable expression.',
            function ()
            {
                const variable = SemanticCreator.newVariableSymbol(
                    BuildInTypes.int,
                    Defaults.variableName + '1'
                );

                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newIntegerLiteral(),
                                        variable
                                    ),
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newVariableExpression(variable)
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n" +
                    `mov r10, ${Defaults.integer}\n` +
                    "mov r11, r10\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a string literal.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newStringLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "c#0:\n" +
                    "dq 11\n" +
                    "db 'Test string'\n" +
                    "[section .text]\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n" +
                    "mov r10, c#0\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a call expression.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newFunctionCall()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n" +
                    `call ${Defaults.identifier}\n` +
                    "mov r10, rax\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile an unary addition.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newUnaryExpression(
                                            SemanticCreator.newIntegerLiteral(),
                                            BuildInOperators.unaryIntAddition
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
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

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile an unary subtraction.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newUnaryExpression(
                                            SemanticCreator.newIntegerLiteral(),
                                            BuildInOperators.unaryIntSubtraction
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n" +
                    `mov r10, ${Defaults.integer}\n` +
                    "neg r10\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
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

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile an equal comparison.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newBinaryExpression(
                                            SemanticCreator.newIntegerLiteral(),
                                            BuildInOperators.binaryIntEqual,
                                            SemanticCreator.newIntegerLiteral()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
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
                    "cmp r10, r11\n" +
                    "je .l#0\n" +
                    "mov r10, 0\n" +
                    "jmp .l#1\n" +
                    ".l#0:\n" +
                    "mov r10, 1\n" +
                    ".l#1:\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
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

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a less than comparison.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newBinaryExpression(
                                            SemanticCreator.newIntegerLiteral(),
                                            BuildInOperators.binaryIntLess,
                                            SemanticCreator.newIntegerLiteral()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
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
                    "cmp r10, r11\n" +
                    "jl .l#0\n" +
                    "mov r10, 0\n" +
                    "jmp .l#1\n" +
                    ".l#0:\n" +
                    "mov r10, 1\n" +
                    ".l#1:\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a greater than comparison.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newBinaryExpression(
                                            SemanticCreator.newIntegerLiteral(),
                                            BuildInOperators.binaryIntGreater,
                                            SemanticCreator.newIntegerLiteral()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
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
                    "cmp r10, r11\n" +
                    "jg .l#0\n" +
                    "mov r10, 0\n" +
                    "jmp .l#1\n" +
                    ".l#0:\n" +
                    "mov r10, 1\n" +
                    ".l#1:\n";

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
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

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a label statement.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newLabel(),
                                ]
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n" +
                    `${Defaults.labelName}:\n`;

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a goto statement.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newGotoStatement(),
                                ]
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n" +
                    `jmp ${Defaults.labelName}\n`;

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );

        it('can transpile a conditional goto statement.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newConditionalGotoStatement(),
                                ]
                            )
                        )
                    ]
                );

                const expectedResult =
                    "[section .rodata]\n" +
                    "[section .text]\n" +
                    "[extern exit]\n" +
                    "[global _start]\n" +
                    "_start:\n" +
                    "call main\n" +
                    "call exit\n" +
                    `${Defaults.identifier}:\n` +
                    "push rbp\n" +
                    "mov rbp, rsp\n" +
                    "mov r10, 1\n" +
                    "cmp r10, 1\n" +
                    `je ${Defaults.labelName}\n`;

                const transpiler = new TranspilerAmd64Linux();

                const result = transpiler.run(input);

                assert.strictEqual(result, expectedResult);
            }
        );
    }
);
