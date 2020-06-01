import 'mocha';
import { assert } from 'chai';
import Lowerer from '../../src/lowerer/lowerer';
import SemanticCreator from '../utility/semanticCreator';

describe('Lowerer',
    function ()
    {
        it('can lower an empty file.',
            function ()
            {
                const input = SemanticCreator.newFile();

                const expectedResult = input;

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower a function declaration.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration()
                    ]
                );

                const expectedResult = input;

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower a section.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection()
                        )
                    ]
                );

                const expectedResult = input;

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower a call statement.',
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

                const expectedResult = input;

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower variable declaration.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration()
                                ]
                            )
                        )
                    ]
                );

                const expectedResult = input;

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower variable assignment.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(),
                                    SemanticCreator.newAssignment(
                                        SemanticCreator.newIntegerLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult = input;

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower variable initialisation.',
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

                const expectedResult = input;

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower an integer addition.',
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

                const expectedResult = input;

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );
    }
);
