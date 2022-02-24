import 'mocha';
import { assert } from 'chai';
import BuildInFunctions from '../../src/definitions/buildInFunctions';
import BuildInOperators from '../../src/definitions/buildInOperators';
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

        it('can lower a variable declaration.',
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

        it('can lower a variable assignment.',
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

        it('can lower a variable initialisation.',
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

        it('can lower a string comparison.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newBinaryExpression(
                                            SemanticCreator.newStringLiteral(),
                                            BuildInOperators.binaryStringEqual,
                                            SemanticCreator.newStringLiteral(),
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newFunctionCall(
                                            [
                                                SemanticCreator.newStringLiteral(),
                                                SemanticCreator.newStringLiteral(),
                                            ],
                                            BuildInFunctions.stringsAreEqual
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower an empty return statement.',
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

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, input); // An empty return statement stays unchanged.
            }
        );

        it('can lower an if statement.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newIfStatement()
                                ]
                            )
                        )
                    ]
                );

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newConditionalGotoStatement(
                                        SemanticCreator.newLabelSymbol('l#0'),
                                        undefined,
                                        false
                                    ),
                                    SemanticCreator.newSection(),
                                    SemanticCreator.newLabel(
                                        SemanticCreator.newLabelSymbol('l#0')
                                    ),
                                ]
                            )
                        )
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower an if else statement.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newIfStatement(
                                        SemanticCreator.newFalseBooleanLiteral(),
                                        undefined,
                                        SemanticCreator.newElseClause()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newConditionalGotoStatement(
                                        SemanticCreator.newLabelSymbol('l#1'), // Goto else label
                                        SemanticCreator.newFalseBooleanLiteral(),
                                        false
                                    ),
                                    SemanticCreator.newSection(),
                                    SemanticCreator.newGotoStatement(
                                        SemanticCreator.newLabelSymbol('l#0') // Goto end label
                                    ),
                                    SemanticCreator.newLabel(
                                        SemanticCreator.newLabelSymbol('l#1') // Else label
                                    ),
                                    SemanticCreator.newSection(),
                                    SemanticCreator.newLabel(
                                        SemanticCreator.newLabelSymbol('l#0') // End label
                                    ),
                                ]
                            )
                        )
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower a while statement.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newWhileStatement()
                                ]
                            )
                        )
                    ]
                );

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newLabel(
                                        SemanticCreator.newLabelSymbol('l#0')
                                    ),
                                    SemanticCreator.newConditionalGotoStatement(
                                        SemanticCreator.newLabelSymbol('l#1'),
                                        undefined,
                                        false
                                    ),
                                    SemanticCreator.newSection(),
                                    SemanticCreator.newGotoStatement(
                                        SemanticCreator.newLabelSymbol('l#0')
                                    ),
                                    SemanticCreator.newLabel(
                                        SemanticCreator.newLabelSymbol('l#1')
                                    )
                                ]
                            )
                        )
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );
    }
);
